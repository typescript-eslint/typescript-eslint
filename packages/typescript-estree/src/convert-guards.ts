import { TSESTree } from '@typescript-eslint/types';
import * as ts from 'typescript';
import { TSNodeUsed } from './ts-estree/ts-nodes';

/**
 * this is not correct yet, additional refining is required
 */
export type BaseGuardType<
  T extends TSNodeUsed,
  KIND = T['kind']
> = KIND extends ts.SyntaxKind.SourceFile
  ? TSESTree.Program
  : KIND extends ts.SyntaxKind.Block
  ? TSESTree.BlockStatement
  : KIND extends ts.SyntaxKind.Identifier
  ? TSESTree.Identifier
  : KIND extends ts.SyntaxKind.WithStatement
  ? TSESTree.WithStatement
  : KIND extends ts.SyntaxKind.WithStatement
  ? TSESTree.WithStatement
  : KIND extends ts.SyntaxKind.ReturnStatement
  ? TSESTree.ReturnStatement
  : KIND extends ts.SyntaxKind.LabeledStatement
  ? TSESTree.LabeledStatement
  : KIND extends ts.SyntaxKind.ContinueStatement
  ? TSESTree.ContinueStatement
  : KIND extends ts.SyntaxKind.BreakStatement
  ? TSESTree.BreakStatement
  : KIND extends ts.SyntaxKind.IfStatement
  ? TSESTree.IfStatement
  : KIND extends ts.SyntaxKind.SwitchStatement
  ? TSESTree.SwitchStatement
  : KIND extends ts.SyntaxKind.CaseClause
  ? TSESTree.SwitchCase
  : KIND extends ts.SyntaxKind.DefaultClause
  ? TSESTree.SwitchCase
  : KIND extends ts.SyntaxKind.ThrowStatement
  ? TSESTree.ThrowStatement
  : KIND extends ts.SyntaxKind.TryStatement
  ? TSESTree.TryStatement
  : KIND extends ts.SyntaxKind.CatchClause
  ? TSESTree.CatchClause
  : KIND extends ts.SyntaxKind.WhileStatement
  ? TSESTree.WhileStatement
  : KIND extends ts.SyntaxKind.DoStatement
  ? TSESTree.DoWhileStatement
  : KIND extends ts.SyntaxKind.ForStatement
  ? TSESTree.ForStatement
  : KIND extends ts.SyntaxKind.ForInStatement
  ? TSESTree.ForInStatement
  : KIND extends ts.SyntaxKind.ForOfStatement
  ? TSESTree.ForOfStatement
  : KIND extends ts.SyntaxKind.FunctionDeclaration
  ? TSESTree.TSDeclareFunction | TSESTree.FunctionDeclaration
  : KIND extends ts.SyntaxKind.VariableDeclaration
  ? TSESTree.VariableDeclarator
  : KIND extends ts.SyntaxKind.VariableStatement
  ? TSESTree.VariableDeclaration
  : KIND extends ts.SyntaxKind.VariableDeclarationList
  ? TSESTree.VariableDeclaration
  : KIND extends ts.SyntaxKind.ExpressionStatement
  ? TSESTree.ExpressionStatement
  : KIND extends ts.SyntaxKind.ThisKeyword
  ? TSESTree.ThisExpression
  : KIND extends ts.SyntaxKind.PropertyAssignment
  ? TSESTree.Property
  : KIND extends ts.SyntaxKind.ShorthandPropertyAssignment
  ? TSESTree.Property
  : KIND extends ts.SyntaxKind.PropertyDeclaration
  ? TSESTree.TSAbstractClassProperty | TSESTree.ClassProperty // TODO: skipped node
  : // TODO: conditional
  KIND extends ts.SyntaxKind.GetAccessor
  ?
      | TSESTree.TSEmptyBodyFunctionExpression
      | TSESTree.TSAbstractMethodDefinition
      | TSESTree.MethodDefinition
      | TSESTree.FunctionExpression
      | TSESTree.Property
  : KIND extends ts.SyntaxKind.SetAccessor
  ?
      | TSESTree.TSEmptyBodyFunctionExpression
      | TSESTree.TSAbstractMethodDefinition
      | TSESTree.MethodDefinition
      | TSESTree.FunctionExpression
      | TSESTree.Property
  : KIND extends ts.SyntaxKind.MethodDeclaration
  ?
      | TSESTree.TSEmptyBodyFunctionExpression
      | TSESTree.TSAbstractMethodDefinition
      | TSESTree.MethodDefinition
      | TSESTree.FunctionExpression
      | TSESTree.Property
  : KIND extends ts.SyntaxKind.Constructor
  ? TSESTree.TSAbstractMethodDefinition | TSESTree.MethodDefinition
  : KIND extends ts.SyntaxKind.FunctionExpression
  ? TSESTree.FunctionExpression
  : KIND extends ts.SyntaxKind.SuperKeyword
  ? TSESTree.Super
  : KIND extends ts.SyntaxKind.ArrayBindingPattern
  ? TSESTree.ArrayPattern
  : KIND extends ts.SyntaxKind.OmittedExpression
  ? null
  : KIND extends ts.SyntaxKind.ObjectBindingPattern
  ? TSESTree.ObjectPattern
  : KIND extends ts.SyntaxKind.ArrowFunction
  ? TSESTree.ArrowFunctionExpression
  : KIND extends ts.SyntaxKind.YieldExpression
  ? TSESTree.YieldExpression
  : KIND extends ts.SyntaxKind.AwaitExpression
  ? TSESTree.AwaitExpression
  : KIND extends
      | ts.SyntaxKind.NoSubstitutionTemplateLiteral
      | ts.SyntaxKind.TemplateExpression
  ? TSESTree.TemplateLiteral
  : KIND extends ts.SyntaxKind.TaggedTemplateExpression
  ? TSESTree.TaggedTemplateExpression
  : KIND extends
      | ts.SyntaxKind.TemplateHead
      | ts.SyntaxKind.TemplateMiddle
      | ts.SyntaxKind.TemplateTail
  ? TSESTree.TemplateElement
  : KIND extends ts.SyntaxKind.Parameter
  ?
      | TSESTree.RestElement
      | TSESTree.AssignmentPattern
      | TSESTree.BindingName
      | TSESTree.TSParameterProperty
  : KIND extends ts.SyntaxKind.ClassDeclaration
  ? TSESTree.ClassDeclaration
  : KIND extends ts.SyntaxKind.ClassExpression
  ? TSESTree.ClassExpression
  : KIND extends ts.SyntaxKind.ModuleBlock
  ? TSESTree.TSModuleBlock
  : KIND extends ts.SyntaxKind.ImportDeclaration
  ? TSESTree.ImportDeclaration
  : KIND extends ts.SyntaxKind.NamespaceImport
  ? TSESTree.ImportNamespaceSpecifier
  : KIND extends ts.SyntaxKind.ImportSpecifier
  ? TSESTree.ImportSpecifier
  : KIND extends ts.SyntaxKind.ImportClause
  ? TSESTree.ImportDefaultSpecifier
  : KIND extends ts.SyntaxKind.ExportDeclaration
  ? TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration
  : KIND extends ts.SyntaxKind.ExportSpecifier
  ? TSESTree.ExportSpecifier
  : KIND extends ts.SyntaxKind.ExportAssignment
  ? TSESTree.TSExportAssignment | TSESTree.ExportDefaultDeclaration
  : KIND extends
      | ts.SyntaxKind.PrefixUnaryExpression
      | ts.SyntaxKind.PostfixUnaryExpression
  ? TSESTree.UpdateExpression | TSESTree.UnaryExpression
  : KIND extends
      | ts.SyntaxKind.DeleteExpression
      | ts.SyntaxKind.VoidExpression
      | ts.SyntaxKind.TypeOfExpression
  ? TSESTree.UnaryExpression
  : KIND extends ts.SyntaxKind.TypeOperator
  ? TSESTree.TSTypeOperator
  : KIND extends
      | ts.SyntaxKind.PropertyAccessExpression
      | ts.SyntaxKind.ElementAccessExpression
  ? TSESTree.MemberExpression | TSESTree.ChainExpression
  : KIND extends ts.SyntaxKind.CallExpression
  ?
      | TSESTree.ImportExpression
      | TSESTree.CallExpression
      | TSESTree.ChainExpression
  : KIND extends ts.SyntaxKind.NewExpression
  ? TSESTree.NewExpression
  : KIND extends ts.SyntaxKind.ConditionalExpression
  ? TSESTree.ConditionalExpression
  : KIND extends ts.SyntaxKind.MetaProperty
  ? TSESTree.MetaProperty
  : KIND extends ts.SyntaxKind.Decorator
  ? TSESTree.Decorator
  : KIND extends ts.SyntaxKind.StringLiteral
  ? TSESTree.StringLiteral
  : KIND extends ts.SyntaxKind.NumericLiteral
  ? TSESTree.NumberLiteral
  : KIND extends ts.SyntaxKind.BigIntLiteral
  ? TSESTree.BigIntLiteral
  : KIND extends ts.SyntaxKind.RegularExpressionLiteral
  ? TSESTree.RegExpLiteral
  : KIND extends ts.SyntaxKind.TrueKeyword
  ? TSESTree.BooleanLiteral
  : KIND extends ts.SyntaxKind.FalseKeyword
  ? TSESTree.BooleanLiteral
  : KIND extends ts.SyntaxKind.NullKeyword
  ? TSESTree.NullLiteral
  : KIND extends ts.SyntaxKind.EmptyStatement
  ? TSESTree.EmptyStatement
  : KIND extends ts.SyntaxKind.DebuggerStatement
  ? TSESTree.DebuggerStatement
  : KIND extends ts.SyntaxKind.JsxFragment
  ? TSESTree.JSXFragment
  : KIND extends ts.SyntaxKind.JsxElement | ts.SyntaxKind.JsxSelfClosingElement
  ? TSESTree.JSXElement
  : KIND extends ts.SyntaxKind.JsxOpeningElement
  ? TSESTree.JSXOpeningElement
  : KIND extends ts.SyntaxKind.JsxClosingElement
  ? TSESTree.JSXClosingElement
  : KIND extends ts.SyntaxKind.JsxOpeningFragment
  ? TSESTree.JSXOpeningFragment
  : KIND extends ts.SyntaxKind.JsxClosingFragment
  ? TSESTree.JSXClosingFragment
  : KIND extends ts.SyntaxKind.JsxExpression
  ? TSESTree.JSXSpreadChild | TSESTree.JSXExpressionContainer
  : KIND extends ts.SyntaxKind.JsxAttribute
  ? TSESTree.JSXAttribute
  : KIND extends ts.SyntaxKind.JsxText
  ? TSESTree.JSXText
  : KIND extends ts.SyntaxKind.JsxSpreadAttribute
  ? TSESTree.JSXSpreadAttribute
  : KIND extends ts.SyntaxKind.QualifiedName
  ? TSESTree.TSQualifiedName
  : KIND extends ts.SyntaxKind.TypeReference
  ? TSESTree.TSTypeReference
  : KIND extends ts.SyntaxKind.TypeParameter
  ? TSESTree.TSTypeParameter
  : KIND extends ts.SyntaxKind.ThisType
  ? TSESTree.TSThisType
  : KIND extends ts.SyntaxKind.AbstractKeyword
  ? TSESTree.TSAbstractKeyword
  : KIND extends ts.SyntaxKind.AnyKeyword
  ? TSESTree.TSAnyKeyword
  : KIND extends ts.SyntaxKind.BigIntKeyword
  ? TSESTree.TSBigIntKeyword
  : KIND extends ts.SyntaxKind.BooleanKeyword
  ? TSESTree.TSBooleanKeyword
  : KIND extends ts.SyntaxKind.NeverKeyword
  ? TSESTree.TSNeverKeyword
  : KIND extends ts.SyntaxKind.NumberKeyword
  ? TSESTree.TSNumberKeyword
  : KIND extends ts.SyntaxKind.ObjectKeyword
  ? TSESTree.TSObjectKeyword
  : KIND extends ts.SyntaxKind.StringKeyword
  ? TSESTree.TSStringKeyword
  : KIND extends ts.SyntaxKind.SymbolKeyword
  ? TSESTree.TSSymbolKeyword
  : KIND extends ts.SyntaxKind.UnknownKeyword
  ? TSESTree.TSUnknownKeyword
  : KIND extends ts.SyntaxKind.VoidKeyword
  ? TSESTree.TSVoidKeyword
  : KIND extends ts.SyntaxKind.UndefinedKeyword
  ? TSESTree.TSUndefinedKeyword
  : KIND extends ts.SyntaxKind.NonNullExpression
  ? TSESTree.TSNonNullExpression | TSESTree.ChainExpression
  : KIND extends ts.SyntaxKind.TypeLiteral
  ? TSESTree.TSTypeLiteral
  : KIND extends ts.SyntaxKind.ArrayType
  ? TSESTree.TSArrayType
  : KIND extends ts.SyntaxKind.IndexedAccessType
  ? TSESTree.TSIndexedAccessType
  : KIND extends ts.SyntaxKind.ConditionalType
  ? TSESTree.TSConditionalType
  : KIND extends ts.SyntaxKind.TypeQuery
  ? TSESTree.TSTypeQuery
  : KIND extends ts.SyntaxKind.MappedType
  ? TSESTree.TSMappedType
  : KIND extends ts.SyntaxKind.TypeAliasDeclaration // TODO: exports
  ? TSESTree.TSTypeAliasDeclaration
  : KIND extends ts.SyntaxKind.MethodSignature
  ? TSESTree.TSMethodSignature
  : KIND extends ts.SyntaxKind.PropertySignature
  ? TSESTree.TSPropertySignature
  : KIND extends ts.SyntaxKind.IndexSignature
  ? TSESTree.TSIndexSignature
  : KIND extends ts.SyntaxKind.ConstructorType
  ? TSESTree.TSConstructorType
  : KIND extends ts.SyntaxKind.FunctionType
  ? TSESTree.TSFunctionType
  : KIND extends ts.SyntaxKind.ConstructSignature
  ? TSESTree.TSConstructSignatureDeclaration
  : KIND extends ts.SyntaxKind.CallSignature
  ? TSESTree.TSCallSignatureDeclaration
  : KIND extends ts.SyntaxKind.ExpressionWithTypeArguments
  ? TSESTree.TSInterfaceHeritage | TSESTree.TSClassImplements
  : KIND extends ts.SyntaxKind.InterfaceDeclaration // TODO: exports
  ? TSESTree.TSInterfaceDeclaration
  : KIND extends ts.SyntaxKind.TypePredicate
  ? TSESTree.TSTypePredicate
  : KIND extends ts.SyntaxKind.ImportType
  ? TSESTree.TSImportType
  : KIND extends ts.SyntaxKind.EnumDeclaration
  ? TSESTree.TSEnumDeclaration
  : KIND extends ts.SyntaxKind.EnumMember
  ? TSESTree.TSEnumMember
  : KIND extends ts.SyntaxKind.ModuleDeclaration
  ? TSESTree.TSModuleDeclaration
  : KIND extends ts.SyntaxKind.ParenthesizedType
  ? TSESTree.TSParenthesizedType
  : KIND extends ts.SyntaxKind.UnionType
  ? TSESTree.TSUnionType
  : KIND extends ts.SyntaxKind.IntersectionType
  ? TSESTree.TSIntersectionType
  : KIND extends ts.SyntaxKind.AsExpression
  ? TSESTree.TSAsExpression
  : KIND extends ts.SyntaxKind.InferType
  ? TSESTree.TSInferType
  : KIND extends ts.SyntaxKind.LiteralType
  ? TSESTree.TSLiteralType | TSESTree.TSNullKeyword
  : KIND extends ts.SyntaxKind.TypeAssertionExpression
  ? TSESTree.TSTypeAssertion
  : KIND extends ts.SyntaxKind.ImportEqualsDeclaration
  ? TSESTree.TSImportEqualsDeclaration
  : KIND extends ts.SyntaxKind.ExternalModuleReference
  ? TSESTree.TSExternalModuleReference
  : KIND extends ts.SyntaxKind.NamespaceExportDeclaration
  ? TSESTree.TSNamespaceExportDeclaration
  : KIND extends ts.SyntaxKind.AbstractKeyword
  ? TSESTree.TSAbstractKeyword
  : KIND extends ts.SyntaxKind.TupleType
  ? TSESTree.TSTupleType
  : KIND extends ts.SyntaxKind.NamedTupleMember
  ? TSESTree.TSNamedTupleMember | TSESTree.TSRestType
  : KIND extends ts.SyntaxKind.OptionalType
  ? TSESTree.TSOptionalType
  : KIND extends ts.SyntaxKind.RestType
  ? TSESTree.TSRestType
  : KIND extends ts.SyntaxKind.TemplateLiteralType
  ? TSESTree.TSTemplateLiteralType
  : KIND extends ts.SyntaxKind.IntrinsicKeyword
  ? TSESTree.TSIntrinsicKeyword
  : KIND extends ts.SyntaxKind.BindingElement
  ?
      | TSESTree.AssignmentPattern // This is possible only when parent is ArrayPattern...
      | TSESTree.RestElement
      | TSESTree.Property
  : KIND extends ts.SyntaxKind.ReadonlyKeyword // we should delete those
  ? TSESTree.TSReadonlyKeyword
  : KIND extends ts.SyntaxKind.ExportKeyword
  ? TSESTree.TSExportKeyword
  : KIND extends ts.SyntaxKind.PrivateKeyword
  ? TSESTree.TSPrivateKeyword
  : KIND extends ts.SyntaxKind.ProtectedKeyword
  ? TSESTree.TSProtectedKeyword
  : KIND extends ts.SyntaxKind.PublicKeyword
  ? TSESTree.TSPublicKeyword
  : KIND extends ts.SyntaxKind.StaticKeyword
  ? TSESTree.TSStaticKeyword
  : KIND extends ts.SyntaxKind.AsyncKeyword
  ? TSESTree.TSAsyncKeyword
  : KIND extends ts.SyntaxKind.DeclareKeyword
  ? TSESTree.TSDeclareKeyword
  : never;

export type NonPatternGuard<
  T extends TSNodeUsed,
  KIND = T['kind']
> = KIND extends ts.SyntaxKind.ArrayLiteralExpression
  ? TSESTree.ArrayExpression
  : KIND extends ts.SyntaxKind.BinaryExpression
  ?
      | TSESTree.SequenceExpression
      | TSESTree.AssignmentExpression
      | TSESTree.LogicalExpression
      | TSESTree.BinaryExpression
  : KIND extends ts.SyntaxKind.SpreadAssignment
  ? TSESTree.SpreadElement
  : KIND extends ts.SyntaxKind.SpreadElement
  ? TSESTree.SpreadElement
  : KIND extends ts.SyntaxKind.ObjectLiteralExpression
  ? TSESTree.ObjectExpression
  : never;

export type PatternGuard<
  T extends TSNodeUsed,
  KIND = T['kind']
> = KIND extends ts.SyntaxKind.ArrayLiteralExpression
  ? TSESTree.ArrayPattern
  : KIND extends ts.SyntaxKind.BinaryExpression
  ? TSESTree.SequenceExpression | TSESTree.AssignmentPattern
  : KIND extends ts.SyntaxKind.SpreadAssignment
  ? TSESTree.RestElement
  : KIND extends ts.SyntaxKind.SpreadElement
  ? TSESTree.RestElement
  : KIND extends ts.SyntaxKind.ObjectLiteralExpression
  ? TSESTree.ObjectPattern
  : never;

// This is really slow - https://github.com/microsoft/TypeScript/pull/42556
// export type TSNodeBaseGuard = TSNodeUsed & { kind: keyof BaseGuard };
export type TSNodeBaseGuard = Exclude<
  TSNodeUsed,
  | TSNodePattern
  // manual fixes
  | ts.ParenthesizedExpression
  | ts.ComputedPropertyName
  | ts.Token<ts.SyntaxKind.ImportKeyword> // this node can be generated only in call expression
  | ts.ExpressionWithTypeArguments
  | ts.HeritageClause
  | ts.CaseBlock
  | ts.NamedImports
  | ts.TemplateSpan
  | ts.NamedExports
>;

// This is really slow - https://github.com/microsoft/TypeScript/pull/42556
// export type TSNodePattern = TSNodeUsed & {
//   kind: keyof PatternGuard | keyof NonPatternGuard;
// };
export type TSNodePattern =
  | ts.ArrayLiteralExpression
  | ts.BinaryExpression
  | ts.SpreadAssignment
  | ts.SpreadElement
  | ts.ObjectLiteralExpression;

export type TSNodeSupported = TSNodePattern | TSNodeBaseGuard;

// ----------------

export type TSNodeConvertable =
  | TSNodeUsed
  | ts.Expression
  | ts.Statement
  | ts.TypeNode
  | ts.TypeElement
  | ts.ClassElement
  | undefined;

export type TSNodeBaseGuardKind = TSNodeBaseGuard['kind'];
export type TSNodePatternKind = TSNodePattern['kind'];

export type TSESTreeToTSNodeGuardHelper<
  T,
  P extends true | false
> = T extends TSNodeBaseGuard
  ? BaseGuardType<T>
  : T extends TSNodePattern
  ? P extends true
    ? PatternGuard<T>
    : NonPatternGuard<T>
  : never;

export type TSESTreeToTSNodeGuard<T, P extends boolean> = T extends
  | ts.ParenthesizedExpression
  | ts.ComputedPropertyName
  ? TSESTreeToTSNodeGuardHelper<TSNodePattern, P>
  : T extends TSNodeBaseGuard
  ? TSESTreeToTSNodeGuardHelper<T, P>
  : T extends
      | ts.Statement
      | ts.Declaration
      | ts.Expression
      | ts.TypeElement
      | ts.TypeNode
  ? any // TSESTreeToTSNodeGuardHelper<Extract<TSNodeSupported, T>, P>
  : null;

export type x = TSESTreeToTSNodeGuard<ts.AccessExpression, true>;

/*export type TSESTreeToTSNodeGuard<
  T extends TSNodeConvertable,
  P extends boolean
> = any;*/

/*
export type TSESTreeToTSNodeGuard<
  T extends TSNodeConvertable,
  P extends true | false
> = T extends ts.ParenthesizedExpression | ts.ComputedPropertyName
  ? TSESTreeToTSNodeGuardHelper<TSNodePattern, P>
  : T extends TSNodeSupported
  ? TSESTreeToTSNodeGuardHelper<T, P>
  : T extends ts.Statement | ts.Declaration | ts.Expression | ts.TypeElement
  ? TSESTreeToTSNodeGuardHelper<Extract<TSNodeSupported, T>, P>
  : null;
*/
// export type TypeTest = Exclude<TSNodeSupported['kind'], keyof PatternGuard>;

// export type TypeTest2 = Exclude<TSNodeSupported['kind'], keyof NonPatternGuard>;

// Expressions - this is needed for optimization
// export type TSNodeExpression = Extract<TSNodeList, ts.Expression>;
// export type TypeTest3 = TSESTreeToTSNodeGuardHelper<TSNodeExpression, true>;

// export type TypeTest4 = Exclude<TSNodeUsed, { kind: unknown }>;
