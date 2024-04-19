import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { MakeRequired } from '../util';
import { createRule, getParserServices } from '../util';

type NodeWithTypeParameters = MakeRequired<
  ts.SignatureDeclaration | ts.ClassLikeDeclaration,
  'typeParameters'
>;

export default createRule({
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Disallow type parameters that only appear once',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      sole: 'Type parameter {{name}} is used only once.',
    },
    schema: [],
    type: 'problem',
  },
  name: 'no-unnecessary-type-parameters',
  create(context) {
    const parserServices = getParserServices(context);
    return {
      [[
        'ArrowFunctionExpression[typeParameters]',
        'ClassDeclaration[typeParameters]',
        'ClassExpression[typeParameters]',
        'FunctionDeclaration[typeParameters]',
        'FunctionExpression[typeParameters]',
        'TSCallSignatureDeclaration[typeParameters]',
        'TSConstructorType[typeParameters]',
        'TSDeclareFunction[typeParameters]',
        'TSEmptyBodyFunctionExpression[typeParameters]',
        'TSFunctionType[typeParameters]',
        'TSMethodSignature[typeParameters]',
      ].join(', ')](node: TSESTree.FunctionLike): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
          node,
        ) as NodeWithTypeParameters;

        const checker = parserServices.program.getTypeChecker();
        const counts = countTypeParameterUsage(checker, tsNode);

        for (const typeParameter of tsNode.typeParameters) {
          const identifierCounts = counts.get(typeParameter.name);
          if (!identifierCounts || identifierCounts > 2) {
            continue;
          }

          context.report({
            data: {
              name: typeParameter.name.text,
            },
            node: parserServices.tsNodeToESTreeNodeMap.get(typeParameter),
            messageId: 'sole',
          });
        }
      },
    };
  },
});

/**
 * Count uses of type parameters in inferred return types.
 * We need to resolve and analyze the inferred return type of a function
 * to see whether it contains additional references to the type parameters.
 * For classes, we need to do this for all their methods.
 */
function countTypeParameterUsage(
  checker: ts.TypeChecker,
  node: NodeWithTypeParameters,
): Map<ts.Identifier, number> {
  const counts = new Map<ts.Identifier, number>();

  if (ts.isClassLike(node)) {
    for (const typeParameter of node.typeParameters) {
      collectTypeParameterUsageCounts(checker, typeParameter, counts);
    }
    for (const member of node.members) {
      collectTypeParameterUsageCounts(checker, member, counts);
    }
  } else {
    collectTypeParameterUsageCounts(checker, node, counts);
  }

  return counts;
}

/**
 * Fills in a counter of the number of times each type parameter appears in
 * the given type by recursively descending through type references.
 * This is essentially a limited subset of the scope manager, but for types.
 */
function collectTypeParameterUsageCounts(
  checker: ts.TypeChecker,
  node: ts.Node,
  identifierCounts: Map<ts.Identifier, number>,
): void {
  const visitedSymbolLists = new Set<ts.Symbol[]>();
  const type = checker.getTypeAtLocation(node);
  const typeCounts = new Map<ts.Type, number>();
  const visitedConstraints = new Set<ts.TypeNode>();
  let functionLikeType = false;
  let visitedDefault = false;

  if (
    ts.isCallSignatureDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  ) {
    functionLikeType = true;
    visitSignature(checker.getSignatureFromDeclaration(node));
  }

  if (!functionLikeType) {
    visitType(type, false);
  }

  function visitType(type: ts.Type | undefined, asRepeatedType: boolean): void {
    // Seeing the same type > (threshold=3 ** 2) times indicates a likely
    // recursive type, like `T = { [P in keyof T]: T }`.
    // If it's not recursive, then heck, we've seen it enough times that any
    // referenced types have been counted enough to qualify as used.
    if (!type || incrementTypeCount(type) > 9) {
      return;
    }

    // https://github.com/JoshuaKGoldberg/ts-api-utils/issues/382
    if ((tsutils.isTypeParameter as (type: ts.Type) => boolean)(type)) {
      const declaration = type.getSymbol()?.getDeclarations()?.[0] as
        | ts.TypeParameterDeclaration
        | undefined;

      if (declaration) {
        incrementIdentifierCount(declaration.name, asRepeatedType);

        // Visiting the type of a constrained type parameter will recurse into
        // the constraint. We avoid infinite loops by visiting each only once.
        if (
          declaration.constraint &&
          !visitedConstraints.has(declaration.constraint)
        ) {
          visitedConstraints.add(declaration.constraint);
          visitType(checker.getTypeAtLocation(declaration.constraint), false);
        }

        if (declaration.default && !visitedDefault) {
          visitedDefault = true;
          visitType(checker.getTypeAtLocation(declaration.default), false);
        }
      }
    }

    // Intersections and unions like `0 | 1`
    else if (tsutils.isUnionOrIntersectionType(type)) {
      visitTypesList(type.types, false);
    }

    // Index access types like `T[K]`
    else if (tsutils.isIndexedAccessType(type)) {
      visitType(type.objectType, false);
      visitType(type.indexType, false);
    }

    // Tuple types like `[K, V]`
    // Generic type references like `Map<K, V>`
    else if (tsutils.isTupleType(type) || tsutils.isTypeReference(type)) {
      for (const typeArgument of type.typeArguments ?? []) {
        visitType(typeArgument, true);
      }
    }

    // Template literals like `a${T}b`
    else if (tsutils.isTemplateLiteralType(type)) {
      for (const subType of type.types) {
        visitType(subType, false);
      }
    }

    // Conditional types like `T extends string ? T : never`
    else if (tsutils.isConditionalType(type)) {
      visitType(type.checkType, false);
      visitType(type.extendsType, false);
    }

    // Catch-all: inferred object types like `{ K: V }`.
    // These catch-alls should be _after_ more specific checks like
    // `isTypeReference` to avoid descending into all the properties of a
    // generic interface/class, e.g. `Map<K, V>`.
    else if (tsutils.isObjectType(type)) {
      visitSymbolsListOnce(type.getProperties(), false);

      if (isMappedType(type)) {
        visitType(type.typeParameter, false);
      }

      for (const typeArgument of type.aliasTypeArguments ?? []) {
        visitType(typeArgument, true);
      }

      visitType(type.getNumberIndexType(), true);
      visitType(type.getStringIndexType(), true);

      type.getCallSignatures().forEach(signature => {
        functionLikeType = true;
        visitSignature(signature);
      });

      type.getConstructSignatures().forEach(signature => {
        functionLikeType = true;
        visitSignature(signature);
      });
    }

    // Catch-all: operator types like `keyof T`
    else if (isOperatorType(type)) {
      visitType(type.type, false);
    }

    // Catch-all: generic type references like `Exclude<T, null>`
    else if (type.aliasTypeArguments) {
      visitTypesList(type.aliasTypeArguments, true);
    }
  }

  function incrementIdentifierCount(
    id: ts.Identifier,
    asRepeatedType: boolean,
  ): void {
    const identifierCount = identifierCounts.get(id) ?? 0;
    const value = asRepeatedType ? 2 : 1;
    identifierCounts.set(id, identifierCount + value);
  }

  function incrementTypeCount(type: ts.Type): number {
    const count = (typeCounts.get(type) ?? 0) + 1;
    typeCounts.set(type, count);
    return count;
  }

  function visitSignature(signature: ts.Signature | undefined): void {
    if (!signature) {
      return;
    }

    if (signature.thisParameter) {
      visitType(checker.getTypeOfSymbol(signature.thisParameter), false);
    }

    for (const parameter of signature.parameters) {
      visitType(checker.getTypeOfSymbol(parameter), false);
    }

    for (const typeParameter of signature.getTypeParameters() ?? []) {
      visitType(typeParameter, false);
    }

    visitType(
      checker.getTypePredicateOfSignature(signature)?.type ??
        signature.getReturnType(),
      false,
    );
  }

  function visitSymbolsListOnce(
    symbols: ts.Symbol[],
    asRepeatedType: boolean,
  ): void {
    if (visitedSymbolLists.has(symbols)) {
      return;
    }

    visitedSymbolLists.add(symbols);

    for (const symbol of symbols) {
      visitType(checker.getTypeOfSymbol(symbol), asRepeatedType);
    }
  }

  function visitTypesList(
    types: readonly ts.Type[] | undefined,

    asRepeatedType: boolean,
  ): void {
    for (const type of types ?? []) {
      visitType(type, asRepeatedType);
    }
  }
}

interface MappedType extends ts.ObjectType {
  typeParameter?: ts.Type;
}

function isMappedType(type: ts.Type): type is MappedType {
  return 'typeParameter' in type;
}

interface OperatorType extends ts.Type {
  type: ts.Type;
}

function isOperatorType(type: ts.Type): type is OperatorType {
  return 'type' in type && !!type.type;
}
