import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
/*
 * Supported:
 *   Identifier Literal MemberExpression ThisExpression
 *   TSNamedTupleMember TSNamespaceExportDeclaration TSNeverKeyword
 *   TSNonNullExpression TSNullKeyword TSNumberKeyword TSObjectKeyword
 *   TSOptionalType TSParameterProperty TSPrivateKeyword TSPropertySignature
 *   TSProtectedKeyword TSPublicKeyword TSQualifiedName TSReadonlyKeyword
 *   TSRestType TSStaticKeyword TSStringKeyword TSSymbolKeyword
 *   TSTemplateLiteralType TSThisType TSTupleType TSTypeAliasDeclaration
 *   TSTypeAnnotation TSTypeAssertion TSTypeLiteral TSTypeOperator
 *   TSTypeParameter TSTypeParameterDeclaration TSTypeParameterInstantiation
 *   TSTypePredicate TSTypeQuery TSTypeReference TSUndefinedKeyword TSUnionType
 *   TSUnknownKeyword TSVoidKeyword UnaryExpression UpdateExpression
 *   VariableDeclaration VariableDeclarator WhileStatement WithStatement
 *   YieldExpression
 */

export function isNodeEqual(a: TSESTree.Node, b: TSESTree.Node): boolean {
  if (a.type !== b.type) {
    return false;
  }
  if (
    a.type === AST_NODE_TYPES.ThisExpression &&
    b.type === AST_NODE_TYPES.ThisExpression
  ) {
    return true;
  }
  if (a.type === AST_NODE_TYPES.Literal && b.type === AST_NODE_TYPES.Literal) {
    return a.value === b.value;
  }
  if (
    a.type === AST_NODE_TYPES.Identifier &&
    b.type === AST_NODE_TYPES.Identifier
  ) {
    return a.name === b.name;
  }
  if (
    a.type === AST_NODE_TYPES.MemberExpression &&
    b.type === AST_NODE_TYPES.MemberExpression
  ) {
    return (
      isNodeEqual(a.property, b.property) && isNodeEqual(a.object, b.object)
    );
  }
  return false;
}
