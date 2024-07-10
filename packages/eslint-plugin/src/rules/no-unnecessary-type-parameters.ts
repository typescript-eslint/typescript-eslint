import type { Reference } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
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
        let counts: Map<ts.Identifier, number> | undefined;

        for (const typeParameter of tsNode.typeParameters) {
          const esTypeParameter =
            parserServices.tsNodeToESTreeNodeMap.get<TSESTree.TSTypeParameter>(
              typeParameter,
            );
          const scope = context.sourceCode.getScope(esTypeParameter);

          // Quick path: if the type parameter is used multiple times in the AST,
          // we don't need to dip into types to know it's repeated.
          if (isTypeParameterRepeatedInAST(esTypeParameter, scope.references)) {
            continue;
          }

          // For any inferred types, we have to dip into type checking.
          counts ??= countTypeParameterUsage(checker, tsNode);
          const identifierCounts = counts.get(typeParameter.name);
          if (!identifierCounts || identifierCounts > 2) {
            continue;
          }

          context.report({
            data: {
              name: typeParameter.name.text,
            },
            node: esTypeParameter,
            messageId: 'sole',
          });
        }
      },
    };
  },
});

function isTypeParameterRepeatedInAST(
  node: TSESTree.TSTypeParameter,
  references: Reference[],
): boolean {
  let total = 0;

  for (const reference of references) {
    // References inside the type parameter's definition don't count.
    if (
      reference.identifier.range[0] < node.range[1] &&
      reference.identifier.range[1] > node.range[0]
    ) {
      continue;
    }

    // Neither do references that aren't to the same type parameter,
    // namely value-land (non-type) identifiers of the type parameter's type,
    // and references to different type parameters or values.
    if (
      !reference.isTypeReference ||
      reference.identifier.name !== node.name.name
    ) {
      continue;
    }

    // If the type parameter is being used as a type argument, then we
    // know the type parameter is being reused and can't be reported.
    if (reference.identifier.parent.type === AST_NODE_TYPES.TSTypeReference) {
      const grandparent = skipConstituentsUpward(
        reference.identifier.parent.parent,
      );
      if (
        grandparent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
        grandparent.params.includes(reference.identifier.parent) &&
        !(
          grandparent.parent.type === AST_NODE_TYPES.TSTypeReference &&
          grandparent.parent.typeName.type === AST_NODE_TYPES.Identifier &&
          ['Array', 'ReadonlyArray'].includes(grandparent.parent.typeName.name)
        )
      ) {
        return true;
      }
    }

    total += 1;

    if (total > 2) {
      return true;
    }
  }

  return false;
}

function skipConstituentsUpward(node: TSESTree.Node): TSESTree.Node {
  switch (node.type) {
    case AST_NODE_TYPES.TSIntersectionType:
    case AST_NODE_TYPES.TSUnionType:
      return skipConstituentsUpward(node.parent);
    default:
      return node;
  }
}

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

// Usually when we encounter a generic type like `Fn<T>`, we assume it uses T
// in multiple places because it might be something like `{a: T, b: T}`. But for
// a few special types like Arrays, we want Array<T> (or T[]) to only count as
// a single use.
const SINGULAR_TYPES = new Set(['Array', 'ReadonlyArray']);

/**
 * Populates {@link foundIdentifierUsages} by the number of times each type parameter
 * appears in the given type by checking its uses through its type references.
 * This is essentially a limited subset of the scope manager, but for types.
 */
function collectTypeParameterUsageCounts(
  checker: ts.TypeChecker,
  node: ts.Node,
  foundIdentifierUsages: Map<ts.Identifier, number>,
): void {
  const visitedSymbolLists = new Set<ts.Symbol[]>();
  const type = checker.getTypeAtLocation(node);
  const typeUsages = new Map<ts.Type, number>();
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

  function visitType(
    type: ts.Type | undefined,
    assumeMultipleUses: boolean,
  ): void {
    // Seeing the same type > (threshold=3 ** 2) times indicates a likely
    // recursive type, like `type T = { [P in keyof T]: T }`.
    // If it's not recursive, then heck, we've seen it enough times that any
    // referenced types have been counted enough to qualify as used.
    if (!type || incrementTypeUsages(type) > 9) {
      return;
    }

    // https://github.com/JoshuaKGoldberg/ts-api-utils/issues/382
    if ((tsutils.isTypeParameter as (type: ts.Type) => boolean)(type)) {
      const declaration = type.getSymbol()?.getDeclarations()?.[0] as
        | ts.TypeParameterDeclaration
        | undefined;

      if (declaration) {
        incrementIdentifierCount(declaration.name, assumeMultipleUses);

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
      visitTypesList(type.types, assumeMultipleUses);
    }

    // Index access types like `T[K]`
    else if (tsutils.isIndexedAccessType(type)) {
      visitType(type.objectType, assumeMultipleUses);
      visitType(type.indexType, assumeMultipleUses);
    }

    // Tuple types like `[K, V]`
    // Generic type references like `Map<K, V>`
    else if (tsutils.isTypeReference(type)) {
      for (const typeArgument of type.typeArguments ?? []) {
        const assumeMultipleUses =
          !tsutils.isTupleType(type.target) &&
          !SINGULAR_TYPES.has(type.symbol.getName());

        visitType(typeArgument, assumeMultipleUses);
      }
    }

    // Template literals like `a${T}b`
    else if (tsutils.isTemplateLiteralType(type)) {
      for (const subType of type.types) {
        visitType(subType, assumeMultipleUses);
      }
    }

    // Conditional types like `T extends string ? T : never`
    else if (tsutils.isConditionalType(type)) {
      visitType(type.checkType, assumeMultipleUses);
      visitType(type.extendsType, assumeMultipleUses);
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
      visitType(type.type, assumeMultipleUses);
    }

    // Catch-all: generic type references like `Exclude<T, null>`
    else if (type.aliasTypeArguments) {
      visitTypesList(type.aliasTypeArguments, true);
    }
  }

  function incrementIdentifierCount(
    id: ts.Identifier,
    assumeMultipleUses: boolean,
  ): void {
    const identifierCount = foundIdentifierUsages.get(id) ?? 0;
    const value = assumeMultipleUses ? 2 : 1;
    foundIdentifierUsages.set(id, identifierCount + value);
  }

  function incrementTypeUsages(type: ts.Type): number {
    const count = (typeUsages.get(type) ?? 0) + 1;
    typeUsages.set(type, count);
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
    assumeMultipleUses: boolean,
  ): void {
    if (visitedSymbolLists.has(symbols)) {
      return;
    }

    visitedSymbolLists.add(symbols);

    for (const symbol of symbols) {
      visitType(checker.getTypeOfSymbol(symbol), assumeMultipleUses);
    }
  }

  function visitTypesList(
    types: readonly ts.Type[],
    assumeMultipleUses: boolean,
  ): void {
    for (const type of types) {
      visitType(type, assumeMultipleUses);
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
