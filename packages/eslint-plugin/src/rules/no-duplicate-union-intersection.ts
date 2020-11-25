import { createRule } from '../util';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

function unpackType(node?: TSESTree.Node): TSESTree.Node | undefined {
  if (node?.type === AST_NODE_TYPES.TSParenthesizedType) {
    return unpackType(node.typeAnnotation);
  }
  return node;
}

function compareArray<T extends TSESTree.Node>(a?: T[], b?: T[]): boolean {
  if (a == null) {
    return b == null;
  }
  if (b == null) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((entry, index) => compareNode(entry, b[index]));
}

function compareLiteral(a: TSESTree.Literal, b: TSESTree.Literal): boolean {
  return a.value === b.value;
}

function compareIdentifier(
  a: TSESTree.Identifier,
  b: TSESTree.Identifier,
): boolean {
  return a.name === b.name && compareNode(a.typeAnnotation, b.typeAnnotation);
}

function compareTSFunctionType(
  a: TSESTree.TSFunctionType,
  b: TSESTree.TSFunctionType,
): boolean {
  // console.log(a.params.map(), b.params);
  return (
    compareNode(a.returnType, b.returnType) &&
    compareNode(a.typeParameters, b.typeParameters) &&
    compareArray(a.params, b.params)
  );
}

function compareTSLiteralType(
  a: TSESTree.TSLiteralType,
  b: TSESTree.TSLiteralType,
): boolean {
  return compareNode(a.literal, b.literal);
}

function compareTSQualifiedName(
  a: TSESTree.TSQualifiedName,
  b: TSESTree.TSQualifiedName,
): boolean {
  return compareNode(a.left, b.left) && compareNode(a.right, b.right);
}

function compareTSTypeAnnotation(
  a: TSESTree.TSTypeAnnotation,
  b: TSESTree.TSTypeAnnotation,
): boolean {
  return compareNode(a.typeAnnotation, b.typeAnnotation);
}

// function compareTSTypeLiteral(
//   a: TSESTree.TSTypeLiteral,
//   b: TSESTree.TSTypeLiteral,
// ): boolean {
//   const aMembers: TSESTree.TSPropertySignatureNonComputedName[] = [];
//   const bMembers: TSESTree.TSPropertySignatureNonComputedName[] = [];
//   for (const member of a.members) {
//     if (member.type !== AST_NODE_TYPES.TSPropertySignature || member.computed) {
//       return false;
//     }
//     aMembers.push(member);
//   }
//   for (const member of b.members) {
//     if (member.type !== AST_NODE_TYPES.TSPropertySignature || member.computed) {
//       return false;
//     }
//     bMembers.push(member);
//   }

//   return compareArray(
//     aMembers.sort(({ key: k1 }, { key: k2 }) => {
//       return (
//         k1.type.localeCompare(k2.type) ||
//         k1.type === AST_NODE_TYPES.TS ?
//       );
//     }),
//     b.members,
//   );
// }

function compareTSTypeParameter(
  a: TSESTree.TSTypeParameter,
  b: TSESTree.TSTypeParameter,
): boolean {
  return compareNode(a.name, b.name);
}

function compareTSTypeParameterInstantiation(
  a: TSESTree.TSTypeParameterInstantiation,
  b: TSESTree.TSTypeParameterInstantiation,
): boolean {
  return compareArray(a.params, b.params);
}

function compareTSTypeParameterDeclaration(
  a: TSESTree.TSTypeParameterDeclaration,
  b: TSESTree.TSTypeParameterDeclaration,
): boolean {
  return compareArray(a.params, b.params);
}

function compareTSTypeReference(
  a: TSESTree.TSTypeReference,
  b: TSESTree.TSTypeReference,
): boolean {
  return (
    compareNode(a.typeName, b.typeName) &&
    compareNode(a.typeParameters, b.typeParameters)
  );
}

function compareNode(c?: TSESTree.Node, d?: TSESTree.Node): boolean {
  const a = unpackType(c);
  const b = unpackType(d);
  if (a == null) {
    return b == null;
  }
  if (b == null) {
    return false;
  }
  if (a.type !== b.type) {
    return false;
  }
  // At this point it’s safe to use `b as typeof a`.

  switch (a.type) {
    case AST_NODE_TYPES.TSAnyKeyword:
    case AST_NODE_TYPES.TSBooleanKeyword:
    case AST_NODE_TYPES.TSBigIntKeyword:
    case AST_NODE_TYPES.TSNeverKeyword:
    case AST_NODE_TYPES.TSNullKeyword:
    case AST_NODE_TYPES.TSNumberKeyword:
    case AST_NODE_TYPES.TSObjectKeyword:
    case AST_NODE_TYPES.TSStringKeyword:
    case AST_NODE_TYPES.TSSymbolKeyword:
    case AST_NODE_TYPES.TSUndefinedKeyword:
    case AST_NODE_TYPES.TSUnknownKeyword:
    case AST_NODE_TYPES.TSVoidKeyword:
      return true;
    case AST_NODE_TYPES.Identifier:
      return compareIdentifier(a, b as typeof a);
    case AST_NODE_TYPES.Literal:
      return compareLiteral(a, b as typeof a);
    case AST_NODE_TYPES.TSFunctionType:
      return compareTSFunctionType(a, b as typeof a);
    case AST_NODE_TYPES.TSLiteralType:
      return compareTSLiteralType(a, b as typeof a);
    case AST_NODE_TYPES.TSQualifiedName:
      return compareTSQualifiedName(a, b as typeof a);
    case AST_NODE_TYPES.TSTypeAnnotation:
      return compareTSTypeAnnotation(a, b as typeof a);
    // case AST_NODE_TYPES.TSTypeLiteral:
    //   return compareTSTypeLiteral(a, b as typeof a);
    case AST_NODE_TYPES.TSTypeParameter:
      return compareTSTypeParameter(a, b as typeof a);
    case AST_NODE_TYPES.TSTypeParameterInstantiation:
      return compareTSTypeParameterInstantiation(a, b as typeof a);
    case AST_NODE_TYPES.TSTypeParameterDeclaration:
      return compareTSTypeParameterDeclaration(a, b as typeof a);
    case AST_NODE_TYPES.TSTypeReference:
      return compareTSTypeReference(a, b as typeof a);
    default:
      return false;
  }
}

export default createRule({
  name: 'no-duplicate-union-intersection',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce or disallow the use of the record type',
      category: 'Possible Errors',
      recommended: false,
    },
    messages: { duplicate: 'This duplicate should be removed' },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function findDuplicates({
      types,
    }: TSESTree.TSIntersectionType | TSESTree.TSUnionType): void {
      const reported = new Set<TSESTree.TypeNode>();

      types.forEach((a, aIndex) => {
        types.slice(aIndex + 1).forEach((b, bIndex) => {
          // No need to report the same node twice.
          if (reported.has(b)) {
            return;
          }
          if (!compareNode(a, b)) {
            return;
          }
          reported.add(b);

          context.report({
            node: b,
            messageId: 'duplicate',
            fix: fixer =>
              fixer.removeRange([types[aIndex + bIndex].range[1], b.range[1]]),
          });
        });
      });
    }

    return {
      TSIntersectionType: findDuplicates,
      TSUnionType: findDuplicates,
    };
  },
});
