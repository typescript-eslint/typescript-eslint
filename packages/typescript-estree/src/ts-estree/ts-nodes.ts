import * as ts from 'typescript';

// Workaround to support new TS version features for consumers on old TS versions
// Eg: https://github.com/typescript-eslint/typescript-eslint/issues/2388, https://github.com/typescript-eslint/typescript-eslint/issues/2784
declare module 'typescript' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface NamedTupleMember extends ts.Node {}
  export interface TemplateLiteralTypeNode extends ts.Node {}
  /* eslint-enable @typescript-eslint/no-empty-interface */
}

export type TSToken = ts.Token<ts.SyntaxKind>;

export type TSNode =
  | ts.Modifier
  | ts.Identifier
  | ts.QualifiedName
  | ts.ComputedPropertyName
  | ts.Decorator
  | ts.TypeParameterDeclaration
  // | ts.SignatureDeclarationBase -> CallSignatureDeclaration, ConstructSignatureDeclaration
  | ts.CallSignatureDeclaration
  | ts.ConstructSignatureDeclaration
  | ts.VariableDeclaration
  | ts.VariableDeclarationList
  | ts.ParameterDeclaration
  | ts.BindingElement
  | ts.PropertySignature
  | ts.PropertyDeclaration
  | ts.PropertyAssignment
  | ts.ShorthandPropertyAssignment
  | ts.SpreadAssignment
  | ts.ObjectBindingPattern
  | ts.ArrayBindingPattern
  | ts.FunctionDeclaration
  | ts.MethodSignature
  | ts.MethodDeclaration
  | ts.ConstructorDeclaration
  | ts.SemicolonClassElement
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration
  | ts.IndexSignatureDeclaration
  | ts.KeywordTypeNode // TODO: This node is bad, maybe we should report this
  | ts.ImportTypeNode
  | ts.ThisTypeNode
  // | ts.FunctionOrConstructorTypeNodeBase -> FunctionTypeNode, ConstructorTypeNode
  | ts.ConstructorTypeNode
  | ts.FunctionTypeNode
  | ts.TypeReferenceNode
  | ts.TypePredicateNode
  | ts.TypeQueryNode
  | ts.TypeLiteralNode
  | ts.ArrayTypeNode
  | ts.NamedTupleMember
  | ts.TupleTypeNode
  | ts.OptionalTypeNode
  | ts.RestTypeNode
  | ts.UnionTypeNode
  | ts.IntersectionTypeNode
  | ts.ConditionalTypeNode
  | ts.InferTypeNode
  | ts.ParenthesizedTypeNode
  | ts.TypeOperatorNode
  | ts.IndexedAccessTypeNode
  | ts.MappedTypeNode
  | ts.LiteralTypeNode
  | ts.StringLiteral
  | ts.OmittedExpression
  | ts.PartiallyEmittedExpression
  | ts.PrefixUnaryExpression
  | ts.PostfixUnaryExpression
  | ts.NullLiteral
  | ts.BooleanLiteral
  | ts.ThisExpression
  | ts.SuperExpression
  | ts.ImportExpression
  | ts.DeleteExpression
  | ts.TypeOfExpression
  | ts.VoidExpression
  | ts.AwaitExpression
  | ts.YieldExpression
  | ts.SyntheticExpression
  | ts.BinaryExpression
  | ts.ConditionalExpression
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.RegularExpressionLiteral
  | ts.NoSubstitutionTemplateLiteral
  | ts.NumericLiteral
  | ts.BigIntLiteral
  | ts.TemplateHead
  | ts.TemplateMiddle
  | ts.TemplateTail
  | ts.TemplateExpression
  | ts.TemplateSpan
  | ts.ParenthesizedExpression
  | ts.ArrayLiteralExpression
  | ts.SpreadElement
  | ts.ObjectLiteralExpression
  | ts.PropertyAccessExpression
  | ts.ElementAccessExpression
  | ts.CallExpression
  | ts.ExpressionWithTypeArguments
  | ts.NewExpression
  | ts.TaggedTemplateExpression
  | ts.AsExpression
  | ts.TypeAssertion
  | ts.NonNullExpression
  | ts.MetaProperty
  | ts.JsxElement
  | ts.JsxOpeningElement
  | ts.JsxSelfClosingElement
  | ts.JsxFragment
  | ts.JsxOpeningFragment
  | ts.JsxClosingFragment
  | ts.JsxAttribute
  | ts.JsxSpreadAttribute
  | ts.JsxClosingElement
  | ts.JsxExpression
  | ts.JsxText
  | ts.NotEmittedStatement
  | ts.CommaListExpression
  | ts.EmptyStatement
  | ts.DebuggerStatement
  | ts.MissingDeclaration
  | ts.Block
  | ts.VariableStatement
  | ts.ExpressionStatement
  | ts.IfStatement
  | ts.DoStatement
  | ts.WhileStatement
  | ts.ForStatement
  | ts.ForInStatement
  | ts.ForOfStatement
  | ts.BreakStatement
  | ts.ContinueStatement
  | ts.ReturnStatement
  | ts.WithStatement
  | ts.SwitchStatement
  | ts.CaseBlock
  | ts.CaseClause
  | ts.DefaultClause
  | ts.LabeledStatement
  | ts.ThrowStatement
  | ts.TryStatement
  | ts.CatchClause
  // | ts.ClassLikeDeclarationBase -> ClassDeclaration | ClassExpression
  | ts.ClassDeclaration
  | ts.ClassExpression
  | ts.InterfaceDeclaration
  | ts.HeritageClause
  | ts.TypeAliasDeclaration
  | ts.EnumMember
  | ts.EnumDeclaration
  | ts.ModuleDeclaration
  | ts.ModuleBlock
  | ts.ImportEqualsDeclaration
  | ts.ExternalModuleReference
  | ts.ImportDeclaration
  | ts.ImportClause
  | ts.NamespaceImport
  | ts.NamespaceExportDeclaration
  | ts.ExportDeclaration
  | ts.NamedImports
  | ts.NamedExports
  | ts.ImportSpecifier
  | ts.ExportSpecifier
  | ts.ExportAssignment
  | ts.SourceFile
  | ts.Bundle
  | ts.InputFiles
  | ts.UnparsedSource
  | ts.JsonMinusNumericLiteral
  | ts.TemplateLiteralTypeNode

  // JSDoc: Unsupported
  | ts.JSDoc
  | ts.JSDocTypeExpression
  | ts.JSDocUnknownTag
  | ts.JSDocAugmentsTag
  | ts.JSDocClassTag
  | ts.JSDocEnumTag
  | ts.JSDocThisTag
  | ts.JSDocTemplateTag
  | ts.JSDocReturnTag
  | ts.JSDocTypeTag
  | ts.JSDocTypedefTag
  | ts.JSDocCallbackTag
  | ts.JSDocSignature
  | ts.JSDocPropertyTag
  | ts.JSDocParameterTag
  | ts.JSDocTypeLiteral
  | ts.JSDocFunctionType
  | ts.JSDocAllType
  | ts.JSDocUnknownType
  | ts.JSDocNullableType
  | ts.JSDocNonNullableType
  | ts.JSDocOptionalType
  | ts.JSDocVariadicType
  | ts.JSDocAuthorTag;
