import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import * as eslintVisitorKeys from 'eslint-visitor-keys';

interface VisitorKeys {
  readonly [type: string]: readonly string[] | undefined;
}

type GetNodeTypeKeys<T extends AST_NODE_TYPES> = Exclude<
  keyof Extract<TSESTree.Node, { type: T }>,
  'type' | 'loc' | 'range' | 'parent'
>;

type KeysDefinedInESLintVisitorKeysCore =
  | AST_NODE_TYPES.AssignmentExpression
  | AST_NODE_TYPES.AssignmentPattern
  | AST_NODE_TYPES.ArrayExpression
  | AST_NODE_TYPES.ArrayPattern
  | AST_NODE_TYPES.ArrowFunctionExpression
  | AST_NODE_TYPES.AwaitExpression
  | AST_NODE_TYPES.BlockStatement
  | AST_NODE_TYPES.BinaryExpression
  | AST_NODE_TYPES.BreakStatement
  | AST_NODE_TYPES.CallExpression
  | AST_NODE_TYPES.CatchClause
  | AST_NODE_TYPES.ChainExpression
  | AST_NODE_TYPES.ClassBody
  | AST_NODE_TYPES.ClassDeclaration
  | AST_NODE_TYPES.ClassExpression
  | AST_NODE_TYPES.ConditionalExpression
  | AST_NODE_TYPES.ContinueStatement
  | AST_NODE_TYPES.DebuggerStatement
  | AST_NODE_TYPES.DoWhileStatement
  | AST_NODE_TYPES.EmptyStatement
  | AST_NODE_TYPES.ExportAllDeclaration
  | AST_NODE_TYPES.ExportDefaultDeclaration
  | AST_NODE_TYPES.ExportNamedDeclaration
  | AST_NODE_TYPES.ExportSpecifier
  | AST_NODE_TYPES.ExpressionStatement
  // | AST_NODE_TYPES.ExperimentalRestProperty
  // | AST_NODE_TYPES.ExperimentalSpreadProperty
  | AST_NODE_TYPES.ForStatement
  | AST_NODE_TYPES.ForInStatement
  | AST_NODE_TYPES.ForOfStatement
  | AST_NODE_TYPES.FunctionDeclaration
  | AST_NODE_TYPES.FunctionExpression
  | AST_NODE_TYPES.Identifier
  | AST_NODE_TYPES.IfStatement
  | AST_NODE_TYPES.ImportDeclaration
  | AST_NODE_TYPES.ImportDefaultSpecifier
  | AST_NODE_TYPES.ImportExpression
  | AST_NODE_TYPES.ImportNamespaceSpecifier
  | AST_NODE_TYPES.ImportSpecifier
  | AST_NODE_TYPES.JSXAttribute
  | AST_NODE_TYPES.JSXClosingElement
  | AST_NODE_TYPES.JSXElement
  | AST_NODE_TYPES.JSXEmptyExpression
  | AST_NODE_TYPES.JSXExpressionContainer
  | AST_NODE_TYPES.JSXIdentifier
  | AST_NODE_TYPES.JSXMemberExpression
  | AST_NODE_TYPES.JSXNamespacedName
  | AST_NODE_TYPES.JSXOpeningElement
  | AST_NODE_TYPES.JSXSpreadAttribute
  | AST_NODE_TYPES.JSXText
  | AST_NODE_TYPES.JSXFragment
  | AST_NODE_TYPES.JSXClosingFragment
  | AST_NODE_TYPES.JSXOpeningFragment
  | AST_NODE_TYPES.Literal
  | AST_NODE_TYPES.LabeledStatement
  | AST_NODE_TYPES.LogicalExpression
  | AST_NODE_TYPES.MemberExpression
  | AST_NODE_TYPES.MetaProperty
  | AST_NODE_TYPES.MethodDefinition
  | AST_NODE_TYPES.NewExpression
  | AST_NODE_TYPES.ObjectExpression
  | AST_NODE_TYPES.ObjectPattern
  | AST_NODE_TYPES.PrivateIdentifier
  | AST_NODE_TYPES.Program
  | AST_NODE_TYPES.Property
  | AST_NODE_TYPES.PropertyDefinition
  | AST_NODE_TYPES.RestElement
  | AST_NODE_TYPES.ReturnStatement
  | AST_NODE_TYPES.SequenceExpression
  | AST_NODE_TYPES.SpreadElement
  | AST_NODE_TYPES.StaticBlock
  | AST_NODE_TYPES.Super
  | AST_NODE_TYPES.SwitchStatement
  | AST_NODE_TYPES.SwitchCase
  | AST_NODE_TYPES.TaggedTemplateExpression
  | AST_NODE_TYPES.TemplateElement
  | AST_NODE_TYPES.TemplateLiteral
  | AST_NODE_TYPES.ThisExpression
  | AST_NODE_TYPES.ThrowStatement
  | AST_NODE_TYPES.TryStatement
  | AST_NODE_TYPES.UnaryExpression
  | AST_NODE_TYPES.UpdateExpression
  | AST_NODE_TYPES.VariableDeclaration
  | AST_NODE_TYPES.VariableDeclarator
  | AST_NODE_TYPES.WhileStatement
  | AST_NODE_TYPES.WithStatement
  | AST_NODE_TYPES.YieldExpression;

// strictly type the arrays of keys provided to make sure we keep this config in sync with the type defs
type AdditionalKeys = {
  readonly // require keys for all nodes NOT defined in `eslint-visitor-keys`
  [T in Exclude<
    AST_NODE_TYPES,
    KeysDefinedInESLintVisitorKeysCore
  >]: readonly GetNodeTypeKeys<T>[];
} & {
  readonly // optionally allow keys for all nodes defined in `eslint-visitor-keys`
  [T in KeysDefinedInESLintVisitorKeysCore]?: readonly GetNodeTypeKeys<T>[];
};

/*
 ********************************** IMPORTANT NOTE ********************************
 *                                                                                *
 * The key arrays should be sorted in the order in which you would want to visit  *
 * the child keys.                                                                *
 *                                                                                *
 *                        DO NOT SORT THEM ALPHABETICALLY!                        *
 *                                                                                *
 * They should be sorted in the order that they appear in the source code.        *
 * For example:                                                                   *
 *                                                                                *
 * class Foo extends Bar { prop: 1 }                                              *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ClassDeclaration                             *
 *       ^^^ id      ^^^ superClass                                               *
 *                       ^^^^^^^^^^^ body                                         *
 *                                                                                *
 * It would be incorrect to provide the visitor keys ['body', 'id', 'superClass'] *
 * because the body comes AFTER everything else in the source code.               *
 * Instead the correct ordering would be ['id', 'superClass', 'body'].            *
 *                                                                                *
 **********************************************************************************
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- TODO - add ignore IIFE option
const SharedVisitorKeys = (() => {
  const FunctionType = ['typeParameters', 'params', 'returnType'] as const;
  const AnonymousFunction = [...FunctionType, 'body'] as const;
  const AbstractPropertyDefinition = [
    'decorators',
    'key',
    'typeAnnotation',
  ] as const;

  return {
    AnonymousFunction,
    Function: ['id', ...AnonymousFunction],
    FunctionType,

    ClassDeclaration: [
      'decorators',
      'id',
      'typeParameters',
      'superClass',
      'superTypeParameters',
      'implements',
      'body',
    ],

    AbstractPropertyDefinition: ['decorators', 'key', 'typeAnnotation'],
    PropertyDefinition: [...AbstractPropertyDefinition, 'value'],
    TypeAssertion: ['expression', 'typeAnnotation'],
  } as const;
})();

const additionalKeys: AdditionalKeys = {
  AccessorProperty: SharedVisitorKeys.PropertyDefinition,
  ArrayPattern: ['decorators', 'elements', 'typeAnnotation'],
  ArrowFunctionExpression: SharedVisitorKeys.AnonymousFunction,
  AssignmentPattern: ['decorators', 'left', 'right', 'typeAnnotation'],
  CallExpression: ['callee', 'typeParameters', 'arguments'],
  ClassDeclaration: SharedVisitorKeys.ClassDeclaration,
  ClassExpression: SharedVisitorKeys.ClassDeclaration,
  Decorator: ['expression'],
  ExportAllDeclaration: ['exported', 'source', 'assertions'],
  ExportNamedDeclaration: ['declaration', 'specifiers', 'source', 'assertions'],
  FunctionDeclaration: SharedVisitorKeys.Function,
  FunctionExpression: SharedVisitorKeys.Function,
  Identifier: ['decorators', 'typeAnnotation'],
  ImportAttribute: ['key', 'value'],
  ImportDeclaration: ['specifiers', 'source', 'assertions'],
  ImportExpression: ['source', 'attributes'],
  JSXClosingFragment: [],
  JSXOpeningElement: ['name', 'typeParameters', 'attributes'],
  JSXOpeningFragment: [],
  JSXSpreadChild: ['expression'],
  MethodDefinition: ['decorators', 'key', 'value', 'typeParameters'],
  NewExpression: ['callee', 'typeParameters', 'arguments'],
  ObjectPattern: ['decorators', 'properties', 'typeAnnotation'],
  PropertyDefinition: SharedVisitorKeys.PropertyDefinition,
  RestElement: ['decorators', 'argument', 'typeAnnotation'],
  StaticBlock: ['body'],
  TaggedTemplateExpression: ['tag', 'typeParameters', 'quasi'],
  TSAbstractAccessorProperty: SharedVisitorKeys.AbstractPropertyDefinition,
  TSAbstractKeyword: [],
  TSAbstractMethodDefinition: ['key', 'value'],
  TSAbstractPropertyDefinition: SharedVisitorKeys.AbstractPropertyDefinition,
  TSAnyKeyword: [],
  TSArrayType: ['elementType'],
  TSAsExpression: SharedVisitorKeys.TypeAssertion,
  TSAsyncKeyword: [],
  TSBigIntKeyword: [],
  TSBooleanKeyword: [],
  TSCallSignatureDeclaration: SharedVisitorKeys.FunctionType,
  TSClassImplements: ['expression', 'typeParameters'],
  TSConditionalType: ['checkType', 'extendsType', 'trueType', 'falseType'],
  TSConstructorType: SharedVisitorKeys.FunctionType,
  TSConstructSignatureDeclaration: SharedVisitorKeys.FunctionType,
  TSDeclareFunction: SharedVisitorKeys.Function,
  TSDeclareKeyword: [],
  TSEmptyBodyFunctionExpression: ['id', ...SharedVisitorKeys.FunctionType],
  TSEnumDeclaration: ['id', 'members'],
  TSEnumMember: ['id', 'initializer'],
  TSExportAssignment: ['expression'],
  TSExportKeyword: [],
  TSExternalModuleReference: ['expression'],
  TSFunctionType: SharedVisitorKeys.FunctionType,
  TSImportEqualsDeclaration: ['id', 'moduleReference'],
  TSImportType: ['parameter', 'qualifier', 'typeParameters'],
  TSIndexedAccessType: ['indexType', 'objectType'],
  TSIndexSignature: ['parameters', 'typeAnnotation'],
  TSInferType: ['typeParameter'],
  TSInstantiationExpression: ['expression', 'typeParameters'],
  TSInterfaceBody: ['body'],
  TSInterfaceDeclaration: ['id', 'typeParameters', 'extends', 'body'],
  TSInterfaceHeritage: ['expression', 'typeParameters'],
  TSIntersectionType: ['types'],
  TSIntrinsicKeyword: [],
  TSLiteralType: ['literal'],
  TSMappedType: ['nameType', 'typeParameter', 'typeAnnotation'],
  TSMethodSignature: ['typeParameters', 'key', 'params', 'returnType'],
  TSModuleBlock: ['body'],
  TSModuleDeclaration: ['id', 'body'],
  TSNamedTupleMember: ['label', 'elementType'],
  TSNamespaceExportDeclaration: ['id'],
  TSNeverKeyword: [],
  TSNonNullExpression: ['expression'],
  TSNullKeyword: [],
  TSNumberKeyword: [],
  TSObjectKeyword: [],
  TSOptionalType: ['typeAnnotation'],
  TSParameterProperty: ['decorators', 'parameter'],
  TSPrivateKeyword: [],
  TSPropertySignature: ['typeAnnotation', 'key', 'initializer'],
  TSProtectedKeyword: [],
  TSPublicKeyword: [],
  TSQualifiedName: ['left', 'right'],
  TSReadonlyKeyword: [],
  TSRestType: ['typeAnnotation'],
  TSSatisfiesExpression: [
    // this is intentionally different to SharedVisitorKeys.TypeAssertion because
    // the type annotation comes first in the source code
    'typeAnnotation',
    'expression',
  ],
  TSStaticKeyword: [],
  TSStringKeyword: [],
  TSSymbolKeyword: [],
  TSTemplateLiteralType: ['quasis', 'types'],
  TSThisType: [],
  TSTupleType: ['elementTypes'],
  TSTypeAliasDeclaration: ['id', 'typeParameters', 'typeAnnotation'],
  TSTypeAnnotation: ['typeAnnotation'],
  TSTypeAssertion: SharedVisitorKeys.TypeAssertion,
  TSTypeLiteral: ['members'],
  TSTypeOperator: ['typeAnnotation'],
  TSTypeParameter: ['name', 'constraint', 'default'],
  TSTypeParameterDeclaration: ['params'],
  TSTypeParameterInstantiation: ['params'],
  TSTypePredicate: ['typeAnnotation', 'parameterName'],
  TSTypeQuery: ['exprName', 'typeParameters'],
  TSTypeReference: ['typeName', 'typeParameters'],
  TSUndefinedKeyword: [],
  TSUnionType: ['types'],
  TSUnknownKeyword: [],
  TSVoidKeyword: [],
};

const visitorKeys: VisitorKeys = eslintVisitorKeys.unionWith(additionalKeys);

export { visitorKeys, VisitorKeys };
