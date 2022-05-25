import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
/*
 * Supported:
 *   Identifier Literal MemberExpression ThisExpression
 * Currently not supported:
 *   ArrayExpression ArrayPattern ArrowFunctionExpression AssignmentExpression
 *   AssignmentPattern AwaitExpression BinaryExpression BlockStatement
 *   BreakStatement CallExpression CatchClause ChainExpression ClassBody
 *   ClassDeclaration ClassExpression ConditionalExpression ContinueStatement
 *   DebuggerStatement Decorator DoWhileStatement EmptyStatement
 *   ExportAllDeclaration ExportDefaultDeclaration ExportNamedDeclaration
 *   ExportSpecifier ExpressionStatement ForInStatement ForOfStatement
 *   ForStatement FunctionDeclaration FunctionExpression IfStatement
 *   ImportAttribute ImportDeclaration ImportDefaultSpecifier ImportExpression
 *   ImportNamespaceSpecifier ImportSpecifier JSXAttribute JSXClosingElement
 *   JSXClosingFragment JSXElement JSXEmptyExpression JSXExpressionContainer
 *   JSXFragment JSXIdentifier JSXMemberExpression JSXNamespacedName
 *   JSXOpeningElement JSXOpeningFragment JSXSpreadAttribute JSXSpreadChild
 *   JSXText LabeledStatement LogicalExpression MetaProperty MethodDefinition
 *   NewExpression ObjectExpression ObjectPattern PrivateIdentifier Program
 *   Property PropertyDefinition RestElement ReturnStatement SequenceExpression
 *   SpreadElement StaticBlock Super SwitchCase SwitchStatement
 *   TaggedTemplateExpression TemplateElement TemplateLiteral ThrowStatement
 *   TryStatement TSAbstractKeyword TSAbstractMethodDefinition
 *   TSAbstractPropertyDefinition TSAnyKeyword TSArrayType TSAsExpression
 *   TSAsyncKeyword TSBigIntKeyword TSBooleanKeyword TSCallSignatureDeclaration
 *   TSClassImplements TSConditionalType TSConstructorType
 *   TSConstructSignatureDeclaration TSDeclareFunction TSDeclareKeyword
 *   TSEmptyBodyFunctionExpression TSEnumDeclaration TSEnumMember
 *   TSExportAssignment TSExportKeyword TSExternalModuleReference
 *   TSFunctionType TSImportEqualsDeclaration TSImportType TSIndexedAccessType
 *   TSIndexSignature TSInferType TSInterfaceBody TSInterfaceDeclaration
 *   TSInterfaceHeritage TSIntersectionType TSIntrinsicKeyword TSLiteralType
 *   TSMappedType TSMethodSignature TSModuleBlock TSModuleDeclaration
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
