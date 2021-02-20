import { TSESTree } from '@typescript-eslint/types';
import * as ts from 'typescript';
import { TSNode } from './ts-estree/ts-nodes';

/**
 * this is not correct yet, additional refining is required
 */
export interface BaseGuard {
  [ts.SyntaxKind.SourceFile]: TSESTree.Program;
  [ts.SyntaxKind.Block]: TSESTree.BlockStatement;
  [ts.SyntaxKind.Identifier]: TSESTree.Identifier;
  [ts.SyntaxKind.WithStatement]: TSESTree.WithStatement;
  [ts.SyntaxKind.ReturnStatement]: TSESTree.ReturnStatement;
  [ts.SyntaxKind.LabeledStatement]: TSESTree.LabeledStatement;
  [ts.SyntaxKind.ContinueStatement]: TSESTree.ContinueStatement;
  [ts.SyntaxKind.BreakStatement]: TSESTree.BreakStatement;
  [ts.SyntaxKind.IfStatement]: TSESTree.IfStatement;
  [ts.SyntaxKind.SwitchStatement]: TSESTree.SwitchStatement;
  [ts.SyntaxKind.CaseClause]: TSESTree.SwitchCase;
  [ts.SyntaxKind.DefaultClause]: TSESTree.SwitchCase;
  [ts.SyntaxKind.ThrowStatement]: TSESTree.ThrowStatement;
  [ts.SyntaxKind.TryStatement]: TSESTree.TryStatement;
  [ts.SyntaxKind.CatchClause]: TSESTree.CatchClause;
  [ts.SyntaxKind.WhileStatement]: TSESTree.WhileStatement;
  [ts.SyntaxKind.DoStatement]: TSESTree.DoWhileStatement;
  [ts.SyntaxKind.ForStatement]: TSESTree.ForStatement;
  [ts.SyntaxKind.ForInStatement]: TSESTree.ForInStatement;
  [ts.SyntaxKind.ForOfStatement]: TSESTree.ForOfStatement;
  [ts.SyntaxKind.FunctionDeclaration]:
    | TSESTree.TSDeclareFunction
    | TSESTree.FunctionDeclaration;
  [ts.SyntaxKind.VariableDeclaration]: TSESTree.VariableDeclarator;
  [ts.SyntaxKind.VariableStatement]: TSESTree.VariableDeclaration;
  [ts.SyntaxKind.VariableDeclarationList]: TSESTree.VariableDeclaration;
  [ts.SyntaxKind.ExpressionStatement]: TSESTree.ExpressionStatement;
  [ts.SyntaxKind.ThisKeyword]: TSESTree.ThisExpression;
  [ts.SyntaxKind.PropertyAssignment]: TSESTree.Property;
  [ts.SyntaxKind.ShorthandPropertyAssignment]: TSESTree.Property;
  // TODO: skipped node
  [ts.SyntaxKind.ComputedPropertyName]: null;
  [ts.SyntaxKind.PropertyDeclaration]:
    | TSESTree.TSAbstractClassProperty
    | TSESTree.ClassProperty;
  // TODO: conditional
  [ts.SyntaxKind.GetAccessor]:
    | TSESTree.TSEmptyBodyFunctionExpression
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.MethodDefinition
    | TSESTree.FunctionExpression
    | TSESTree.Property;
  [ts.SyntaxKind.SetAccessor]:
    | TSESTree.TSEmptyBodyFunctionExpression
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.MethodDefinition
    | TSESTree.FunctionExpression
    | TSESTree.Property;
  [ts.SyntaxKind.MethodDeclaration]:
    | TSESTree.TSEmptyBodyFunctionExpression
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.MethodDefinition
    | TSESTree.FunctionExpression
    | TSESTree.Property;
  [ts.SyntaxKind.Constructor]:
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.MethodDefinition;
  [ts.SyntaxKind.FunctionExpression]: TSESTree.FunctionExpression;
  [ts.SyntaxKind.SuperKeyword]: TSESTree.Super;
  [ts.SyntaxKind.ArrayBindingPattern]: TSESTree.ArrayPattern;
  [ts.SyntaxKind.OmittedExpression]: null;
  [ts.SyntaxKind.ObjectBindingPattern]: TSESTree.ObjectPattern;
  [ts.SyntaxKind.ArrowFunction]: TSESTree.ArrowFunctionExpression;
  [ts.SyntaxKind.YieldExpression]: TSESTree.YieldExpression;
  [ts.SyntaxKind.AwaitExpression]: TSESTree.AwaitExpression;
  [ts.SyntaxKind.NoSubstitutionTemplateLiteral]: TSESTree.TemplateLiteral;
  [ts.SyntaxKind.TemplateExpression]: TSESTree.TemplateLiteral;
  [ts.SyntaxKind.TaggedTemplateExpression]: TSESTree.TaggedTemplateExpression;
  [ts.SyntaxKind.TemplateHead]: TSESTree.TemplateElement;
  [ts.SyntaxKind.TemplateMiddle]: TSESTree.TemplateElement;
  [ts.SyntaxKind.TemplateTail]: TSESTree.TemplateElement;
  [ts.SyntaxKind.Parameter]:
    | TSESTree.RestElement
    | TSESTree.AssignmentPattern
    | TSESTree.TSParameterProperty;
  [ts.SyntaxKind.ClassDeclaration]: TSESTree.ClassDeclaration;
  [ts.SyntaxKind.ClassExpression]: TSESTree.ClassExpression;
  [ts.SyntaxKind.ModuleBlock]: TSESTree.TSModuleBlock;
  [ts.SyntaxKind.ImportDeclaration]: TSESTree.ImportDeclaration;
  [ts.SyntaxKind.NamespaceImport]: TSESTree.ImportNamespaceSpecifier;
  [ts.SyntaxKind.ImportSpecifier]: TSESTree.ImportSpecifier;
  [ts.SyntaxKind.ImportClause]: TSESTree.ImportDefaultSpecifier;
  [ts.SyntaxKind.ExportDeclaration]:
    | TSESTree.ExportNamedDeclaration
    | TSESTree.ExportAllDeclaration;
  [ts.SyntaxKind.ExportSpecifier]: TSESTree.ExportSpecifier;
  [ts.SyntaxKind.ExportAssignment]:
    | TSESTree.TSExportAssignment
    | TSESTree.ExportDefaultDeclaration;
  [ts.SyntaxKind.PrefixUnaryExpression]:
    | TSESTree.UpdateExpression
    | TSESTree.UnaryExpression;
  [ts.SyntaxKind.PostfixUnaryExpression]:
    | TSESTree.UpdateExpression
    | TSESTree.UnaryExpression;
  [ts.SyntaxKind.DeleteExpression]: TSESTree.UnaryExpression;
  [ts.SyntaxKind.VoidExpression]: TSESTree.UnaryExpression;
  [ts.SyntaxKind.TypeOfExpression]: TSESTree.UnaryExpression;
  [ts.SyntaxKind.TypeOperator]: TSESTree.TSTypeOperator;
  [ts.SyntaxKind.PropertyAccessExpression]:
    | TSESTree.MemberExpression
    | TSESTree.ChainExpression;
  [ts.SyntaxKind.ElementAccessExpression]:
    | TSESTree.MemberExpression
    | TSESTree.ChainExpression;
  [ts.SyntaxKind.CallExpression]:
    | TSESTree.ImportExpression
    | TSESTree.CallExpression
    | TSESTree.ChainExpression;
  [ts.SyntaxKind.NewExpression]: TSESTree.NewExpression;
  [ts.SyntaxKind.ConditionalExpression]: TSESTree.ConditionalExpression;
  [ts.SyntaxKind.MetaProperty]: TSESTree.MetaProperty;
  [ts.SyntaxKind.Decorator]: TSESTree.Decorator;
  [ts.SyntaxKind.StringLiteral]: TSESTree.StringLiteral;
  [ts.SyntaxKind.NumericLiteral]: TSESTree.NumberLiteral;
  [ts.SyntaxKind.BigIntLiteral]: TSESTree.BigIntLiteral;
  [ts.SyntaxKind.RegularExpressionLiteral]: TSESTree.RegExpLiteral;
  [ts.SyntaxKind.TrueKeyword]: TSESTree.BooleanLiteral;
  [ts.SyntaxKind.FalseKeyword]: TSESTree.BooleanLiteral;
  [ts.SyntaxKind.NullKeyword]: TSESTree.NullLiteral | TSESTree.TSNullKeyword;
  [ts.SyntaxKind.EmptyStatement]: TSESTree.EmptyStatement;
  [ts.SyntaxKind.DebuggerStatement]: TSESTree.DebuggerStatement;
  [ts.SyntaxKind.JsxElement]: TSESTree.JSXElement;
  [ts.SyntaxKind.JsxFragment]: TSESTree.JSXFragment;
  [ts.SyntaxKind.JsxSelfClosingElement]: TSESTree.JSXElement;
  [ts.SyntaxKind.JsxOpeningElement]: TSESTree.JSXOpeningElement;
  [ts.SyntaxKind.JsxClosingElement]: TSESTree.JSXClosingElement;
  [ts.SyntaxKind.JsxOpeningFragment]: TSESTree.JSXOpeningFragment;
  [ts.SyntaxKind.JsxClosingFragment]: TSESTree.JSXClosingFragment;
  [ts.SyntaxKind.JsxExpression]:
    | TSESTree.JSXSpreadChild
    | TSESTree.JSXExpressionContainer;
  [ts.SyntaxKind.JsxAttribute]: TSESTree.JSXAttribute;
  [ts.SyntaxKind.JsxText]: TSESTree.JSXText;
  [ts.SyntaxKind.JsxSpreadAttribute]: TSESTree.JSXSpreadAttribute;
  [ts.SyntaxKind.QualifiedName]: TSESTree.TSQualifiedName;
  [ts.SyntaxKind.TypeReference]: TSESTree.TSTypeReference;
  [ts.SyntaxKind.TypeParameter]: TSESTree.TSTypeParameter;
  [ts.SyntaxKind.ThisType]: TSESTree.TSThisType;
  [ts.SyntaxKind.AnyKeyword]: TSESTree.TSAnyKeyword;
  [ts.SyntaxKind.BigIntKeyword]: TSESTree.TSBigIntKeyword;
  [ts.SyntaxKind.BooleanKeyword]: TSESTree.TSBooleanKeyword;
  [ts.SyntaxKind.NeverKeyword]: TSESTree.TSNeverKeyword;
  [ts.SyntaxKind.NumberKeyword]: TSESTree.TSNumberKeyword;
  [ts.SyntaxKind.ObjectKeyword]: TSESTree.TSObjectKeyword;
  [ts.SyntaxKind.StringKeyword]: TSESTree.TSStringKeyword;
  [ts.SyntaxKind.SymbolKeyword]: TSESTree.TSSymbolKeyword;
  [ts.SyntaxKind.UnknownKeyword]: TSESTree.TSUnknownKeyword;
  [ts.SyntaxKind.VoidKeyword]: TSESTree.TSVoidKeyword;
  [ts.SyntaxKind.UndefinedKeyword]: TSESTree.TSUndefinedKeyword;
  [ts.SyntaxKind.NonNullExpression]:
    | TSESTree.TSNonNullExpression
    | TSESTree.ChainExpression;
  [ts.SyntaxKind.TypeLiteral]: TSESTree.TSTypeLiteral;
  [ts.SyntaxKind.ArrayType]: TSESTree.TSArrayType;
  [ts.SyntaxKind.IndexedAccessType]: TSESTree.TSIndexedAccessType;
  [ts.SyntaxKind.ConditionalType]: TSESTree.TSConditionalType;
  [ts.SyntaxKind.TypeQuery]: TSESTree.TSTypeQuery;
  [ts.SyntaxKind.MappedType]: TSESTree.TSMappedType;
  // TODO: exports
  [ts.SyntaxKind.TypeAliasDeclaration]: TSESTree.TSTypeAliasDeclaration;
  [ts.SyntaxKind.MethodSignature]: TSESTree.TSMethodSignature;
  [ts.SyntaxKind.PropertySignature]: TSESTree.TSPropertySignature;
  [ts.SyntaxKind.IndexSignature]: TSESTree.TSIndexSignature;
  [ts.SyntaxKind.ConstructorType]: TSESTree.TSConstructorType;
  [ts.SyntaxKind.FunctionType]: TSESTree.TSFunctionType;
  [ts.SyntaxKind.ConstructSignature]: TSESTree.TSConstructSignatureDeclaration;
  [ts.SyntaxKind.CallSignature]: TSESTree.TSCallSignatureDeclaration;
  [ts.SyntaxKind.ExpressionWithTypeArguments]:
    | TSESTree.TSInterfaceHeritage
    | TSESTree.TSClassImplements;
  // TODO: exports
  [ts.SyntaxKind.InterfaceDeclaration]: TSESTree.TSInterfaceDeclaration;
  [ts.SyntaxKind.TypePredicate]: TSESTree.TSTypePredicate;
  [ts.SyntaxKind.ImportType]: TSESTree.TSImportType;
  [ts.SyntaxKind.EnumDeclaration]: TSESTree.TSEnumDeclaration;
  [ts.SyntaxKind.EnumMember]: TSESTree.TSEnumMember;
  [ts.SyntaxKind.ModuleDeclaration]: TSESTree.TSModuleDeclaration;
  [ts.SyntaxKind.ParenthesizedType]: TSESTree.TSParenthesizedType;
  [ts.SyntaxKind.UnionType]: TSESTree.TSUnionType;
  [ts.SyntaxKind.IntersectionType]: TSESTree.TSIntersectionType;
  [ts.SyntaxKind.AsExpression]: TSESTree.TSAsExpression;
  [ts.SyntaxKind.InferType]: TSESTree.TSInferType;
  [ts.SyntaxKind.LiteralType]: TSESTree.TSLiteralType;
  [ts.SyntaxKind.TypeAssertionExpression]: TSESTree.TSTypeAssertion;
  [ts.SyntaxKind.ImportEqualsDeclaration]: TSESTree.TSImportEqualsDeclaration;
  [ts.SyntaxKind.ExternalModuleReference]: TSESTree.TSExternalModuleReference;
  [ts.SyntaxKind
    .NamespaceExportDeclaration]: TSESTree.TSNamespaceExportDeclaration;
  [ts.SyntaxKind.AbstractKeyword]: TSESTree.TSAbstractKeyword;
  [ts.SyntaxKind.TupleType]: TSESTree.TSTupleType;
  [ts.SyntaxKind.NamedTupleMember]:
    | TSESTree.TSNamedTupleMember
    | TSESTree.TSRestType;
  [ts.SyntaxKind.OptionalType]: TSESTree.TSOptionalType;
  [ts.SyntaxKind.RestType]: TSESTree.TSRestType;
  [ts.SyntaxKind.TemplateLiteralType]: TSESTree.TSTemplateLiteralType;
  [ts.SyntaxKind.IntrinsicKeyword]: TSESTree.TSIntrinsicKeyword;
}

export interface NonPatternGuard extends BaseGuard {
  [ts.SyntaxKind.BindingElement]:
    | TSESTree.AssignmentPattern
    | TSESTree.RestElement
    | TSESTree.Property;
  [ts.SyntaxKind.ArrayLiteralExpression]: TSESTree.ArrayExpression;
  [ts.SyntaxKind.BinaryExpression]:
    | TSESTree.SequenceExpression
    | TSESTree.AssignmentExpression
    | TSESTree.LogicalExpression
    | TSESTree.BinaryExpression;
  [ts.SyntaxKind.SpreadAssignment]: TSESTree.SpreadElement;
  [ts.SyntaxKind.SpreadElement]: TSESTree.SpreadElement;
  [ts.SyntaxKind.ObjectLiteralExpression]: TSESTree.ObjectExpression;
}

export interface PatternGuard extends BaseGuard {
  [ts.SyntaxKind.BindingElement]: TSESTree.AssignmentPattern;
  [ts.SyntaxKind.ArrayLiteralExpression]: TSESTree.ArrayPattern;
  [ts.SyntaxKind.BinaryExpression]:
    | TSESTree.SequenceExpression
    | TSESTree.AssignmentPattern;
  [ts.SyntaxKind.SpreadAssignment]: TSESTree.RestElement;
  [ts.SyntaxKind.SpreadElement]: TSESTree.RestElement;
  [ts.SyntaxKind.ObjectLiteralExpression]: TSESTree.ObjectPattern;
}

export type TSNodePattern = TSNode & {
  kind: keyof PatternGuard | keyof NonPatternGuard;
};
export type TSNodeBaseGuard = TSNode & { kind: keyof BaseGuard };

export type TSNodeSupported =
  | TSNodePattern
  | TSNodeBaseGuard
  | ts.ParenthesizedExpression;

export type TSNodeExpression = Exclude<
  Extract<TSNodeSupported, ts.Expression>,
  // manual fixes
  | ts.OmittedExpression // there is advanced handling for this node in type guards
  | ts.Token<ts.SyntaxKind.ImportKeyword> // this node can be generated only in call expression
>;
export type TSNodeStatement = Extract<TSNodeSupported, ts.Statement>;
export type TSNodeTypeNode = Exclude<
  Extract<TSNodeSupported, ts.TypeNode>,
  // manual fixes
  ts.ExpressionWithTypeArguments
>;
export type TSNodeTypeElement = Extract<TSNodeSupported, ts.TypeElement>;
export type TSNodeClassElement = Extract<TSNodeSupported, ts.ClassElement>;

export type TSNodeConvertable =
  | TSNode
  | ts.Expression
  | ts.Statement
  | ts.TypeNode
  | ts.TypeElement
  | ts.ClassElement
  | undefined;

export type TSESTreeToTSNode2<T, P extends boolean> = T extends TSNodeBaseGuard
  ? BaseGuard[T['kind']]
  : T extends TSNodePattern
  ? P extends true
    ? PatternGuard[T['kind']]
    : NonPatternGuard[T['kind']]
  : TSESTreeToTSNode2<TSNodePattern, P>;

export type TSESTreeToTSNodeGuard<
  T extends TSNodeConvertable,
  P extends boolean
> = T extends TSNodeSupported
  ? TSESTreeToTSNode2<T, P>
  : T extends ts.Expression
  ? TSESTreeToTSNode2<TSNodeExpression, P>
  : T extends ts.Statement
  ? TSESTreeToTSNode2<TSNodeStatement, P>
  : T extends ts.TypeNode
  ? TSESTreeToTSNode2<TSNodeTypeNode, P>
  : T extends ts.TypeElement
  ? TSESTreeToTSNode2<TSNodeTypeElement, P>
  : T extends ts.ClassElement
  ? TSESTreeToTSNode2<TSNodeClassElement, P>
  : null;

export type TypeTest = Exclude<TSNodeSupported['kind'], keyof PatternGuard>;

export type TypeTest2 = Exclude<TSNodeSupported['kind'], keyof NonPatternGuard>;
