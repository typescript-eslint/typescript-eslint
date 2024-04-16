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
          if (
            !identifierCounts ||
            identifierCounts.general > 2 ||
            (identifierCounts.general &&
              identifierCounts.general + identifierCounts.return > 2)
          ) {
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

interface IdentifierCounts {
  general: number;
  return: number;
}

type IdentifierArea = keyof IdentifierCounts;

/**
 * Count uses of type parameters in inferred return types.
 * We need to resolve and analyze the inferred return type of a function
 * to see whether it contains additional references to the type parameters.
 * For classes, we need to do this for all their methods.
 */
function countTypeParameterUsage(
  checker: ts.TypeChecker,
  node: NodeWithTypeParameters,
): Map<ts.Identifier, IdentifierCounts> {
  const counts = new Map<ts.Identifier, IdentifierCounts>();

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
  counts: Map<ts.Identifier, IdentifierCounts>,
): void {
  const visitedTypeProperties = new Set<unknown>();
  const type = checker.getTypeAtLocation(node);
  let functionLikeType = false;
  let visitedConstraint = false;
  let visitedDefault = false;

  if (
    ts.isCallSignatureDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  ) {
    functionLikeType = true;
    visitSignature(checker.getSignatureFromDeclaration(node), 'general');
  }

  // console.log({ functionLikeType });
  if (!functionLikeType) {
    visitType(type, 'general', false);
  }

  function increment(
    id: ts.Identifier,
    area: IdentifierArea,
    asTypeArgument: boolean,
  ): void {
    const value = asTypeArgument ? 2 : 1;
    const identifierCounts = counts.get(id) ?? { general: 0, return: 0 };
    identifierCounts[area] += value;
    counts.set(id, identifierCounts);
  }

  function visitType(
    type: ts.Type | undefined,
    area: IdentifierArea,
    asTypeArgument: boolean,
  ): void {
    if (!type) {
      return;
    }

    // https://github.com/JoshuaKGoldberg/ts-api-utils/issues/382
    if ((tsutils.isTypeParameter as (type: ts.Type) => boolean)(type)) {
      const declaration = type.getSymbol()?.getDeclarations()?.[0] as
        | ts.TypeParameterDeclaration
        | undefined;

      if (declaration) {
        increment(declaration.name, area, asTypeArgument);

        if (declaration.constraint && !visitedConstraint) {
          visitedConstraint = true;
          visitType(
            checker.getTypeAtLocation(declaration.constraint),
            area,
            false,
          );
        }

        if (declaration.default && !visitedDefault) {
          visitedDefault = true;
          visitType(
            checker.getTypeAtLocation(declaration.default),
            area,
            false,
          );
        }
      }
    }

    // Intersections and unions like `0 | 1`
    else if (tsutils.isUnionOrIntersectionType(type)) {
      visitTypesListOnce(type.types, area, false);
    }

    // Index access types like `T[K]`
    else if (tsutils.isIndexedAccessType(type)) {
      visitType(type.objectType, area, false);
      visitType(type.indexType, area, false);
    }

    // Tuple types like `[K, V]`
    // Generic type references like `Map<K, V>`
    else if (tsutils.isTupleType(type) || tsutils.isTypeReference(type)) {
      for (const typeArgument of type.typeArguments ?? []) {
        visitType(typeArgument, area, true);
      }
    }

    // Inferred object types. This should be _after_
    // isTypeReference to avoid descending into all the properties of a
    // generic interface/class, e.g. Map<K, V>.
    else if (tsutils.isObjectType(type)) {
      for (const symbol of type.getProperties()) {
        visitType(checker.getTypeOfSymbol(symbol), area, false);
      }

      if (isMappedType(type)) {
        visitType(type.modifiersType, area, false);
      }

      for (const typeArgument of type.aliasTypeArguments ?? []) {
        visitType(typeArgument, area, true);
      }

      visitType(type.getNumberIndexType(), area, true);
      visitType(type.getStringIndexType(), area, true);

      type.getCallSignatures().forEach(signature => {
        functionLikeType = true;
        visitSignature(signature, area);
      });

      type.getConstructSignatures().forEach(signature => {
        functionLikeType = true;
        visitSignature(signature, area);
      });
    }

    // Template literals like `a${T}b`
    else if (tsutils.isTemplateLiteralType(type)) {
      for (const subType of type.types) {
        visitType(subType, area, false);
      }
    }

    // Catch-all: operator types like `keyof T`
    else if ('type' in type && type.type) {
      visitType(type.type as ts.Type, area, false);
    }

    // Catch-all: generic type references like `Exclude<T, null>`
    else if (
      'aliasTypeArguments' in type &&
      Array.isArray(type.aliasTypeArguments)
    ) {
      visitTypesListOnce(type.aliasTypeArguments as ts.Type[], area, true);
    }
  }

  function visitTypesListOnce(
    typeOrTypes: ts.Type[] | undefined,
    area: IdentifierArea,
    asTypeArgument: boolean,
  ): void {
    if (!typeOrTypes || visitedTypeProperties.has(typeOrTypes)) {
      return;
    }

    visitedTypeProperties.add(typeOrTypes);

    for (const type of typeOrTypes) {
      visitType(type, area, asTypeArgument);
    }
  }

  function visitSignature(
    signature: ts.Signature | undefined,
    area: IdentifierArea,
  ): void {
    if (!signature) {
      return;
    }

    if (signature.thisParameter) {
      visitType(checker.getTypeOfSymbol(signature.thisParameter), area, false);
    }

    for (const parameter of signature.parameters) {
      visitType(checker.getTypeOfSymbol(parameter), area, false);
    }

    for (const typeParameter of signature.getTypeParameters() ?? []) {
      visitType(typeParameter, area, false);
    }

    visitType(signature.getReturnType(), 'return', false);

    visitType(
      checker.getTypePredicateOfSignature(signature)?.type,
      'return',
      false,
    );
  }
}

interface MappedType extends ts.ObjectType {
  modifiersType?: ts.Type;
}

function isMappedType(type: ts.Type): type is MappedType {
  return 'modifiersType' in type;
}
