import { TSNode } from './ts-nodes';
import { AST_NODE_TYPES } from './ast-node-types';
import { Node } from './ts-estree';
import * as ts from 'typescript';

export interface EstreeToTsNodeTypes {
  [AST_NODE_TYPES.ArrayExpression]: ts.SyntaxKind.ArrayLiteralExpression;
  [AST_NODE_TYPES.ArrayPattern]:
    | ts.SyntaxKind.ArrayLiteralExpression
    | ts.SyntaxKind.ArrayBindingPattern;
  [AST_NODE_TYPES.ArrowFunctionExpression]: ts.SyntaxKind.ArrowFunction;
  [AST_NODE_TYPES.AssignmentExpression]: ts.SyntaxKind.BinaryExpression;
  [AST_NODE_TYPES.AssignmentPattern]:
    | ts.SyntaxKind.ShorthandPropertyAssignment
    | ts.SyntaxKind.BindingElement
    | ts.SyntaxKind.BinaryExpression
    | ts.SyntaxKind.Parameter;
  [AST_NODE_TYPES.AwaitExpression]: ts.SyntaxKind.AwaitExpression;
  [AST_NODE_TYPES.BigIntLiteral]: ts.SyntaxKind.BigIntLiteral;
  [AST_NODE_TYPES.BinaryExpression]: ts.SyntaxKind.BinaryExpression;
  [AST_NODE_TYPES.BlockStatement]: ts.SyntaxKind.Block;
  [AST_NODE_TYPES.BreakStatement]: ts.SyntaxKind.BreakStatement;
  [AST_NODE_TYPES.CallExpression]: ts.SyntaxKind.CallExpression;
  [AST_NODE_TYPES.CatchClause]: ts.SyntaxKind.CatchClause;
  [AST_NODE_TYPES.ClassBody]:
    | ts.SyntaxKind.ClassDeclaration
    | ts.SyntaxKind.ClassExpression;
  [AST_NODE_TYPES.ClassDeclaration]: ts.SyntaxKind.ClassDeclaration;
  [AST_NODE_TYPES.ClassExpression]: ts.SyntaxKind.ClassExpression;
  [AST_NODE_TYPES.ClassProperty]: ts.SyntaxKind.PropertyDeclaration;
  [AST_NODE_TYPES.ConditionalExpression]: ts.SyntaxKind.ConditionalExpression;
  [AST_NODE_TYPES.ContinueStatement]: ts.SyntaxKind.ContinueStatement;
  [AST_NODE_TYPES.DebuggerStatement]: ts.SyntaxKind.DebuggerStatement;
  [AST_NODE_TYPES.Decorator]: ts.SyntaxKind.Decorator;
  [AST_NODE_TYPES.DoWhileStatement]: ts.SyntaxKind.DoStatement;
  [AST_NODE_TYPES.EmptyStatement]: ts.SyntaxKind.EmptyStatement;
  [AST_NODE_TYPES.ExportAllDeclaration]: ts.SyntaxKind.ExportDeclaration;
  [AST_NODE_TYPES.ExportDefaultDeclaration]:
    | ts.SyntaxKind.ExportAssignment
    | ts.SyntaxKind.FunctionDeclaration
    | ts.SyntaxKind.VariableStatement
    | ts.SyntaxKind.ClassDeclaration
    | ts.SyntaxKind.ClassExpression
    | ts.SyntaxKind.TypeAliasDeclaration
    | ts.SyntaxKind.InterfaceDeclaration
    | ts.SyntaxKind.EnumDeclaration
    | ts.SyntaxKind.ModuleDeclaration;
  [AST_NODE_TYPES.ExportNamedDeclaration]:
    | ts.SyntaxKind.ExportDeclaration
    | ts.SyntaxKind.FunctionDeclaration
    | ts.SyntaxKind.VariableStatement
    | ts.SyntaxKind.ClassDeclaration
    | ts.SyntaxKind.ClassExpression
    | ts.SyntaxKind.TypeAliasDeclaration
    | ts.SyntaxKind.InterfaceDeclaration
    | ts.SyntaxKind.EnumDeclaration
    | ts.SyntaxKind.ModuleDeclaration;
  [AST_NODE_TYPES.ExportSpecifier]: ts.SyntaxKind.ExportSpecifier;
  [AST_NODE_TYPES.ExpressionStatement]: ts.SyntaxKind.ExpressionStatement;
  [AST_NODE_TYPES.ForInStatement]: ts.SyntaxKind.ForInStatement;
  [AST_NODE_TYPES.ForOfStatement]: ts.SyntaxKind.ForOfStatement;
  [AST_NODE_TYPES.ForStatement]: ts.SyntaxKind.ForStatement;
  [AST_NODE_TYPES.FunctionDeclaration]: ts.SyntaxKind.FunctionDeclaration;
  [AST_NODE_TYPES.FunctionExpression]:
    | ts.SyntaxKind.FunctionExpression
    | ts.SyntaxKind.Constructor
    | ts.SyntaxKind.GetAccessor
    | ts.SyntaxKind.SetAccessor
    | ts.SyntaxKind.MethodDeclaration;
  [AST_NODE_TYPES.Identifier]:
    | ts.SyntaxKind.Identifier
    | ts.SyntaxKind.MetaProperty
    | ts.SyntaxKind.Constructor;
  [AST_NODE_TYPES.IfStatement]: ts.SyntaxKind.IfStatement;
  [AST_NODE_TYPES.Import]: ts.SyntaxKind.ImportKeyword;
  [AST_NODE_TYPES.ImportDeclaration]: ts.SyntaxKind.ImportDeclaration;
  [AST_NODE_TYPES.ImportDefaultSpecifier]: ts.SyntaxKind.ImportClause;
  [AST_NODE_TYPES.ImportNamespaceSpecifier]: ts.SyntaxKind.NamespaceImport;
  [AST_NODE_TYPES.ImportSpecifier]: ts.SyntaxKind.ImportSpecifier;
  [AST_NODE_TYPES.JSXAttribute]: ts.SyntaxKind.JsxAttribute;
  [AST_NODE_TYPES.JSXClosingElement]: ts.SyntaxKind.JsxClosingElement;
  [AST_NODE_TYPES.JSXClosingFragment]: ts.SyntaxKind.JsxClosingFragment;
  [AST_NODE_TYPES.JSXElement]:
    | ts.SyntaxKind.JsxElement
    | ts.SyntaxKind.JsxSelfClosingElement;
  [AST_NODE_TYPES.JSXEmptyExpression]: ts.SyntaxKind.JsxExpression;
  [AST_NODE_TYPES.JSXExpressionContainer]: ts.SyntaxKind.JsxExpression;
  [AST_NODE_TYPES.JSXFragment]: ts.SyntaxKind.JsxFragment;
  [AST_NODE_TYPES.JSXIdentifier]:
    | ts.SyntaxKind.Identifier
    | ts.SyntaxKind.ThisKeyword;
  [AST_NODE_TYPES.JSXOpeningElement]:
    | ts.SyntaxKind.JsxOpeningElement
    | ts.SyntaxKind.JsxSelfClosingElement;
  [AST_NODE_TYPES.JSXOpeningFragment]: ts.SyntaxKind.JsxOpeningFragment;
  [AST_NODE_TYPES.JSXSpreadAttribute]: ts.SyntaxKind.JsxSpreadAttribute;
  [AST_NODE_TYPES.JSXSpreadChild]: ts.SyntaxKind.JsxExpression;
  [AST_NODE_TYPES.JSXMemberExpression]: ts.SyntaxKind.PropertyAccessExpression;
  [AST_NODE_TYPES.JSXText]: ts.SyntaxKind.JsxText;
  [AST_NODE_TYPES.LabeledStatement]: ts.SyntaxKind.LabeledStatement;
  [AST_NODE_TYPES.Literal]:
    | ts.SyntaxKind.StringLiteral
    | ts.SyntaxKind.NumericLiteral
    | ts.SyntaxKind.RegularExpressionLiteral
    | ts.SyntaxKind.JsxText
    | ts.SyntaxKind.NullKeyword
    | ts.SyntaxKind.FalseKeyword
    | ts.SyntaxKind.TrueKeyword;
  [AST_NODE_TYPES.LogicalExpression]: ts.SyntaxKind.BinaryExpression;
  [AST_NODE_TYPES.MemberExpression]:
    | ts.SyntaxKind.PropertyAccessExpression
    | ts.SyntaxKind.ElementAccessExpression;
  [AST_NODE_TYPES.MetaProperty]: ts.SyntaxKind.MetaProperty;
  [AST_NODE_TYPES.MethodDefinition]:
    | ts.SyntaxKind.GetAccessor
    | ts.SyntaxKind.SetAccessor
    | ts.SyntaxKind.MethodDeclaration
    | ts.SyntaxKind.Constructor;
  [AST_NODE_TYPES.NewExpression]: ts.SyntaxKind.NewExpression;
  [AST_NODE_TYPES.ObjectExpression]: ts.SyntaxKind.ObjectLiteralExpression;
  [AST_NODE_TYPES.ObjectPattern]:
    | ts.SyntaxKind.ObjectLiteralExpression
    | ts.SyntaxKind.ObjectBindingPattern;
  [AST_NODE_TYPES.OptionalCallExpression]: ts.SyntaxKind.CallExpression;
  [AST_NODE_TYPES.OptionalMemberExpression]:
    | ts.SyntaxKind.PropertyAccessExpression
    | ts.SyntaxKind.ElementAccessExpression;
  [AST_NODE_TYPES.Program]: ts.SyntaxKind.SourceFile;
  [AST_NODE_TYPES.Property]:
    | ts.SyntaxKind.PropertyAssignment
    | ts.SyntaxKind.ShorthandPropertyAssignment
    | ts.SyntaxKind.GetAccessor
    | ts.SyntaxKind.SetAccessor
    | ts.SyntaxKind.MethodDeclaration
    | ts.SyntaxKind.BindingElement;
  [AST_NODE_TYPES.RestElement]:
    | ts.SyntaxKind.BindingElement
    | ts.SyntaxKind.SpreadAssignment
    | ts.SyntaxKind.SpreadElement
    | ts.SyntaxKind.Parameter;
  [AST_NODE_TYPES.ReturnStatement]: ts.SyntaxKind.ReturnStatement;
  [AST_NODE_TYPES.SequenceExpression]: ts.SyntaxKind.BinaryExpression;
  [AST_NODE_TYPES.SpreadElement]:
    | ts.SyntaxKind.SpreadElement
    | ts.SyntaxKind.SpreadAssignment;
  [AST_NODE_TYPES.Super]: ts.SyntaxKind.SuperKeyword;
  [AST_NODE_TYPES.SwitchCase]:
    | ts.SyntaxKind.CaseClause
    | ts.SyntaxKind.DefaultClause;
  [AST_NODE_TYPES.SwitchStatement]: ts.SyntaxKind.SwitchStatement;
  [AST_NODE_TYPES.TaggedTemplateExpression]: ts.SyntaxKind.TaggedTemplateExpression;
  [AST_NODE_TYPES.TemplateElement]:
    | ts.SyntaxKind.NoSubstitutionTemplateLiteral
    | ts.SyntaxKind.TemplateHead
    | ts.SyntaxKind.TemplateMiddle
    | ts.SyntaxKind.TemplateTail;
  [AST_NODE_TYPES.TemplateLiteral]:
    | ts.SyntaxKind.NoSubstitutionTemplateLiteral
    | ts.SyntaxKind.TemplateExpression;
  [AST_NODE_TYPES.ThisExpression]: ts.SyntaxKind.ThisKeyword;
  [AST_NODE_TYPES.ThrowStatement]: ts.SyntaxKind.ThrowStatement;
  [AST_NODE_TYPES.TryStatement]: ts.SyntaxKind.TryStatement;
  [AST_NODE_TYPES.TSAbstractClassProperty]: ts.SyntaxKind.PropertyDeclaration;
  [AST_NODE_TYPES.TSAbstractKeyword]: ts.SyntaxKind.AbstractKeyword;
  [AST_NODE_TYPES.TSAbstractMethodDefinition]:
    | ts.SyntaxKind.GetAccessor
    | ts.SyntaxKind.SetAccessor
    | ts.SyntaxKind.MethodDeclaration
    | ts.SyntaxKind.Constructor;
  [AST_NODE_TYPES.TSAnyKeyword]: ts.SyntaxKind.AnyKeyword;
  [AST_NODE_TYPES.TSArrayType]: ts.SyntaxKind.ArrayType;
  [AST_NODE_TYPES.TSAsExpression]: ts.SyntaxKind.AsExpression;
  [AST_NODE_TYPES.TSAsyncKeyword]: ts.SyntaxKind.AsyncKeyword;
  [AST_NODE_TYPES.TSBigIntKeyword]: ts.SyntaxKind.BigIntKeyword;
  [AST_NODE_TYPES.TSBooleanKeyword]: ts.SyntaxKind.BooleanKeyword;
  [AST_NODE_TYPES.TSCallSignatureDeclaration]: ts.SyntaxKind.PropertySignature;
  [AST_NODE_TYPES.TSClassImplements]: ts.SyntaxKind.ExpressionWithTypeArguments;
  [AST_NODE_TYPES.TSConditionalType]: ts.SyntaxKind.ConditionalType;
  [AST_NODE_TYPES.TSConstructorType]: ts.SyntaxKind.ConstructorType;
  [AST_NODE_TYPES.TSConstructSignatureDeclaration]:
    | ts.SyntaxKind.ConstructorType
    | ts.SyntaxKind.FunctionType
    | ts.SyntaxKind.ConstructSignature
    | ts.SyntaxKind.CallSignature;
  [AST_NODE_TYPES.TSDeclareFunction]: ts.SyntaxKind.FunctionDeclaration;
  [AST_NODE_TYPES.TSDeclareKeyword]: ts.SyntaxKind.DeclareKeyword;
  [AST_NODE_TYPES.TSEmptyBodyFunctionExpression]: unknown; // TODO FIX ME
  [AST_NODE_TYPES.TSEnumDeclaration]: ts.SyntaxKind.EnumDeclaration;
  [AST_NODE_TYPES.TSEnumMember]: ts.SyntaxKind.EnumMember;
  [AST_NODE_TYPES.TSExportAssignment]: ts.SyntaxKind.ExportAssignment;
  [AST_NODE_TYPES.TSExportKeyword]: ts.SyntaxKind.ExportKeyword;
  [AST_NODE_TYPES.TSExternalModuleReference]: ts.SyntaxKind.ExternalModuleReference;
  [AST_NODE_TYPES.TSFunctionType]: ts.SyntaxKind.FunctionType;
  [AST_NODE_TYPES.TSImportEqualsDeclaration]: ts.SyntaxKind.ImportEqualsDeclaration;
  [AST_NODE_TYPES.TSImportType]: ts.SyntaxKind.ImportType;
  [AST_NODE_TYPES.TSIndexedAccessType]: ts.SyntaxKind.IndexedAccessType;
  [AST_NODE_TYPES.TSIndexSignature]: ts.SyntaxKind.IndexSignature;
  [AST_NODE_TYPES.TSInferType]: ts.SyntaxKind.InferType;
  [AST_NODE_TYPES.TSInterfaceDeclaration]: ts.SyntaxKind.InterfaceDeclaration;
  [AST_NODE_TYPES.TSInterfaceBody]: ts.SyntaxKind.InterfaceDeclaration;
  [AST_NODE_TYPES.TSInterfaceHeritage]: ts.SyntaxKind.ExpressionWithTypeArguments;
  [AST_NODE_TYPES.TSIntersectionType]: ts.SyntaxKind.IntersectionType;
  [AST_NODE_TYPES.TSLiteralType]: ts.SyntaxKind.LiteralType;
  [AST_NODE_TYPES.TSMappedType]: ts.SyntaxKind.MappedType;
  [AST_NODE_TYPES.TSMethodSignature]: ts.SyntaxKind.MethodSignature;
  [AST_NODE_TYPES.TSModuleBlock]: ts.SyntaxKind.ModuleBlock;
  [AST_NODE_TYPES.TSModuleDeclaration]: ts.SyntaxKind.ModuleDeclaration;
  [AST_NODE_TYPES.TSNamespaceExportDeclaration]: ts.SyntaxKind.NamespaceExportDeclaration;
  [AST_NODE_TYPES.TSNeverKeyword]: ts.SyntaxKind.NeverKeyword;
  [AST_NODE_TYPES.TSNonNullExpression]: ts.SyntaxKind.NonNullExpression;
  [AST_NODE_TYPES.TSNullKeyword]: ts.SyntaxKind.NullKeyword;
  [AST_NODE_TYPES.TSNumberKeyword]: ts.SyntaxKind.NumberKeyword;
  [AST_NODE_TYPES.TSObjectKeyword]: ts.SyntaxKind.ObjectKeyword;
  [AST_NODE_TYPES.TSOptionalType]: ts.SyntaxKind.OptionalType;
  [AST_NODE_TYPES.TSParameterProperty]: ts.SyntaxKind.Parameter;
  [AST_NODE_TYPES.TSParenthesizedType]: ts.SyntaxKind.ParenthesizedType;
  [AST_NODE_TYPES.TSPropertySignature]: ts.SyntaxKind.PropertySignature;
  [AST_NODE_TYPES.TSPublicKeyword]: ts.SyntaxKind.PublicKeyword;
  [AST_NODE_TYPES.TSPrivateKeyword]: ts.SyntaxKind.PrivateKeyword;
  [AST_NODE_TYPES.TSProtectedKeyword]: ts.SyntaxKind.ProtectedKeyword;
  [AST_NODE_TYPES.TSQualifiedName]: ts.SyntaxKind.QualifiedName;
  [AST_NODE_TYPES.TSReadonlyKeyword]: ts.SyntaxKind.ReadonlyKeyword;
  [AST_NODE_TYPES.TSRestType]: ts.SyntaxKind.RestType;
  [AST_NODE_TYPES.TSStaticKeyword]: ts.SyntaxKind.StaticKeyword;
  [AST_NODE_TYPES.TSStringKeyword]: ts.SyntaxKind.StringKeyword;
  [AST_NODE_TYPES.TSSymbolKeyword]: ts.SyntaxKind.SymbolKeyword;
  [AST_NODE_TYPES.TSThisType]: ts.SyntaxKind.ThisType;
  [AST_NODE_TYPES.TSTupleType]: ts.SyntaxKind.TupleType;
  [AST_NODE_TYPES.TSTypeAliasDeclaration]: ts.SyntaxKind.TypeAliasDeclaration;
  [AST_NODE_TYPES.TSTypeAnnotation]: undefined;
  [AST_NODE_TYPES.TSTypeAssertion]: ts.SyntaxKind.TypeAssertionExpression;
  [AST_NODE_TYPES.TSTypeLiteral]: ts.SyntaxKind.TypeLiteral;
  [AST_NODE_TYPES.TSTypeOperator]: ts.SyntaxKind.TypeOperator;
  [AST_NODE_TYPES.TSTypeParameter]: ts.SyntaxKind.TypeParameter;
  [AST_NODE_TYPES.TSTypeParameterDeclaration]: undefined;
  [AST_NODE_TYPES.TSTypeParameterInstantiation]:
    | ts.SyntaxKind.TaggedTemplateExpression
    | ts.SyntaxKind.ImportType
    | ts.SyntaxKind.ExpressionWithTypeArguments
    | ts.SyntaxKind.TypeReference
    | ts.SyntaxKind.JsxOpeningElement
    | ts.SyntaxKind.JsxSelfClosingElement
    | ts.SyntaxKind.NewExpression
    | ts.SyntaxKind.CallExpression;
  [AST_NODE_TYPES.TSTypePredicate]: ts.SyntaxKind.TypePredicate;
  [AST_NODE_TYPES.TSTypeQuery]: ts.SyntaxKind.TypeQuery;
  [AST_NODE_TYPES.TSTypeReference]: ts.SyntaxKind.TypeReference;
  [AST_NODE_TYPES.TSUndefinedKeyword]: ts.SyntaxKind.UndefinedKeyword;
  [AST_NODE_TYPES.TSUnionType]: ts.SyntaxKind.UnionType;
  [AST_NODE_TYPES.TSUnknownKeyword]: ts.SyntaxKind.UnknownKeyword;
  [AST_NODE_TYPES.TSVoidKeyword]: ts.SyntaxKind.VoidKeyword;
  [AST_NODE_TYPES.UpdateExpression]:
    | ts.SyntaxKind.PrefixUnaryExpression
    | ts.SyntaxKind.PostfixUnaryExpression;
  [AST_NODE_TYPES.UnaryExpression]:
    | ts.SyntaxKind.PrefixUnaryExpression
    | ts.SyntaxKind.PostfixUnaryExpression
    | ts.SyntaxKind.DeleteExpression
    | ts.SyntaxKind.VoidExpression
    | ts.SyntaxKind.TypeOfExpression;
  [AST_NODE_TYPES.VariableDeclaration]:
    | ts.SyntaxKind.VariableDeclarationList
    | ts.SyntaxKind.VariableStatement;
  [AST_NODE_TYPES.VariableDeclarator]: ts.SyntaxKind.VariableDeclaration;
  [AST_NODE_TYPES.WhileStatement]: ts.SyntaxKind.WhileStatement;
  [AST_NODE_TYPES.WithStatement]: ts.SyntaxKind.WithStatement;
  [AST_NODE_TYPES.YieldExpression]: ts.SyntaxKind.YieldExpression;
}

export type TSESTreeToTSNode<T extends Node = Node> = Extract<
  TSNode,
  {
    kind: EstreeToTsNodeTypes[T['type']];
  }
>;
