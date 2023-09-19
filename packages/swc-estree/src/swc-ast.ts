import type {
  ArrayExpression,
  ArrayPattern,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentPattern,
  AssignmentPatternProperty,
  AssignmentProperty,
  AwaitExpression,
  BigIntLiteral,
  BinaryExpression,
  BlockStatement,
  BooleanLiteral,
  BreakStatement,
  CallExpression,
  CatchClause,
  ClassDeclaration,
  ClassExpression,
  ClassMethod,
  ClassProperty,
  ComputedPropName,
  ConditionalExpression,
  Constructor,
  ContinueStatement,
  DebuggerStatement,
  Decorator,
  DoWhileStatement,
  EmptyStatement,
  ExportAllDeclaration,
  ExportDeclaration,
  ExportDefaultDeclaration,
  ExportDefaultExpression,
  ExportDefaultSpecifier,
  ExportNamedDeclaration,
  ExportNamespaceSpecifier,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  GetterProperty,
  Identifier,
  IfStatement,
  Import,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  JSXAttribute,
  JSXClosingElement,
  JSXClosingFragment,
  JSXElement,
  JSXEmptyExpression,
  JSXExpressionContainer,
  JSXFragment,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  JSXOpeningFragment,
  JSXSpreadChild,
  JSXText,
  KeyValuePatternProperty,
  KeyValueProperty,
  LabeledStatement,
  MemberExpression,
  MetaProperty,
  MethodProperty,
  Module,
  NamedExportSpecifier,
  NamedImportSpecifier,
  NewExpression,
  NullLiteral,
  NumericLiteral,
  ObjectExpression,
  ObjectPattern,
  OptionalChainingExpression,
  Param,
  ParenthesisExpression,
  PrivateMethod,
  PrivateName,
  PrivateProperty,
  RegExpLiteral,
  RestElement,
  ReturnStatement,
  Script,
  SequenceExpression,
  SetterProperty,
  SpreadElement,
  StaticBlock,
  StringLiteral,
  Super,
  SuperPropExpression,
  SwitchCase,
  SwitchStatement,
  TaggedTemplateExpression,
  TemplateElement,
  TemplateLiteral,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  TsArrayType,
  TsAsExpression,
  TsCallSignatureDeclaration,
  TsConditionalType,
  TsConstAssertion,
  TsConstructorType,
  TsConstructSignatureDeclaration,
  TsEnumDeclaration,
  TsEnumMember,
  TsExportAssignment,
  TsExpressionWithTypeArguments,
  TsExternalModuleReference,
  TsFunctionType,
  TsGetterSignature,
  TsImportEqualsDeclaration,
  TsImportType,
  TsIndexedAccessType,
  TsIndexSignature,
  TsInferType,
  TsInstantiation,
  TsInterfaceBody,
  TsInterfaceDeclaration,
  TsIntersectionType,
  TsKeywordType,
  TsLiteralType,
  TsMappedType,
  TsMethodSignature,
  TsModuleBlock,
  TsModuleDeclaration,
  TsNamespaceDeclaration,
  TsNamespaceExportDeclaration,
  TsNonNullExpression,
  TsOptionalType,
  TsParameterProperty,
  TsParenthesizedType,
  TsPropertySignature,
  TsQualifiedName,
  TsRestType,
  TsSatisfiesExpression,
  TsSetterSignature,
  TsThisType,
  TsTupleElement,
  TsTupleType,
  TsTypeAliasDeclaration,
  TsTypeAnnotation,
  TsTypeAssertion,
  TsTypeLiteral,
  TsTypeOperator,
  TsTypeParameter,
  TsTypeParameterDeclaration,
  TsTypeParameterInstantiation,
  TsTypePredicate,
  TsTypeQuery,
  TsTypeReference,
  TsUnionType,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  WithStatement,
  YieldExpression,
  // Invalid
} from '@swc/types';

export type SwcNode =
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | AssignmentExpression
  | AssignmentPattern
  | AssignmentPatternProperty
  | AssignmentProperty
  | AwaitExpression
  | BigIntLiteral
  | BinaryExpression
  | BlockStatement
  | BooleanLiteral
  | BreakStatement
  | CallExpression
  | CatchClause
  | ClassDeclaration
  | ClassExpression
  | ClassMethod
  | ClassProperty
  | ComputedPropName
  | ConditionalExpression
  | Constructor
  | ContinueStatement
  | DebuggerStatement
  | Decorator
  | DoWhileStatement
  | EmptyStatement
  | ExportAllDeclaration
  | ExportDeclaration
  | ExportDefaultDeclaration
  | ExportDefaultExpression
  | ExportDefaultSpecifier
  | ExportNamedDeclaration
  | ExportNamespaceSpecifier
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | GetterProperty
  | Identifier
  | IfStatement
  | Import
  | ImportDeclaration
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | JSXAttribute
  | JSXClosingElement
  | JSXClosingFragment
  | JSXElement
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXFragment
  | JSXMemberExpression
  | JSXNamespacedName
  | JSXOpeningElement
  | JSXOpeningFragment
  | JSXSpreadChild
  | JSXText
  | KeyValuePatternProperty
  | KeyValueProperty
  | LabeledStatement
  | MemberExpression
  | MetaProperty
  | MethodProperty
  | Module
  | NamedExportSpecifier
  | NamedImportSpecifier
  | NewExpression
  | NullLiteral
  | NumericLiteral
  | ObjectExpression
  | ObjectPattern
  | OptionalChainingExpression
  | Param
  | ParenthesisExpression
  | PrivateMethod
  | PrivateName
  | PrivateProperty
  | RegExpLiteral
  | RestElement
  | ReturnStatement
  | Script
  | SequenceExpression
  | SetterProperty
  | SpreadElement
  | StaticBlock
  | StringLiteral
  | Super
  | SuperPropExpression
  | SwitchCase
  | SwitchStatement
  | TaggedTemplateExpression
  | TemplateElement
  | TemplateLiteral
  | ThisExpression
  | ThrowStatement
  | TryStatement
  | TsArrayType
  | TsAsExpression
  | TsCallSignatureDeclaration
  | TsConditionalType
  | TsConstAssertion
  | TsConstructorType
  | TsConstructSignatureDeclaration
  | TsEnumDeclaration
  | TsEnumMember
  | TsExportAssignment
  | TsExpressionWithTypeArguments
  | TsExternalModuleReference
  | TsFunctionType
  | TsGetterSignature
  | TsImportEqualsDeclaration
  | TsImportType
  | TsIndexedAccessType
  | TsIndexSignature
  | TsInferType
  | TsInstantiation
  | TsInterfaceBody
  | TsInterfaceDeclaration
  | TsIntersectionType
  | TsKeywordType
  | TsLiteralType
  | TsMappedType
  | TsMethodSignature
  | TsModuleBlock
  | TsModuleDeclaration
  | TsNamespaceDeclaration
  | TsNamespaceExportDeclaration
  | TsNonNullExpression
  | TsOptionalType
  | TsParameterProperty
  | TsParenthesizedType
  | TsPropertySignature
  | TsQualifiedName
  | TsRestType
  | TsSatisfiesExpression
  | TsSetterSignature
  | TsThisType
  | TsTupleElement
  | TsTupleType
  | TsTypeAliasDeclaration
  | TsTypeAnnotation
  | TsTypeAssertion
  | TsTypeLiteral
  | TsTypeOperator
  | TsTypeParameter
  | TsTypeParameterDeclaration
  | TsTypeParameterInstantiation
  | TsTypePredicate
  | TsTypeQuery
  | TsTypeReference
  | TsUnionType
  | UnaryExpression
  | UpdateExpression
  | VariableDeclaration
  | VariableDeclarator
  | WhileStatement
  | WithStatement
  | YieldExpression;

export type SwcNodeType = SwcNode['type'];

export {
  ArrayExpression,
  ArrayPattern,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentPattern,
  AssignmentPatternProperty,
  AssignmentProperty,
  AwaitExpression,
  BigIntLiteral,
  BinaryExpression,
  BlockStatement,
  BooleanLiteral,
  BreakStatement,
  CallExpression,
  CatchClause,
  ClassDeclaration,
  ClassExpression,
  ClassMethod,
  ClassProperty,
  ComputedPropName,
  ConditionalExpression,
  Constructor,
  ContinueStatement,
  DebuggerStatement,
  Decorator,
  DoWhileStatement,
  EmptyStatement,
  ExportAllDeclaration,
  ExportDeclaration,
  ExportDefaultDeclaration,
  ExportDefaultExpression,
  ExportDefaultSpecifier,
  ExportNamedDeclaration,
  ExportNamespaceSpecifier,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  GetterProperty,
  Identifier,
  IfStatement,
  Import,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  JSXAttribute,
  JSXClosingElement,
  JSXClosingFragment,
  JSXElement,
  JSXEmptyExpression,
  JSXExpressionContainer,
  JSXFragment,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  JSXOpeningFragment,
  JSXSpreadChild,
  JSXText,
  KeyValuePatternProperty,
  KeyValueProperty,
  LabeledStatement,
  MemberExpression,
  MetaProperty,
  MethodProperty,
  Module,
  NamedExportSpecifier,
  NamedImportSpecifier,
  NewExpression,
  NullLiteral,
  NumericLiteral,
  ObjectExpression,
  ObjectPattern,
  OptionalChainingExpression,
  Param,
  ParenthesisExpression,
  PrivateMethod,
  PrivateName,
  PrivateProperty,
  RegExpLiteral,
  RestElement,
  ReturnStatement,
  Script,
  SequenceExpression,
  SetterProperty,
  SpreadElement,
  StaticBlock,
  StringLiteral,
  Super,
  SuperPropExpression,
  SwitchCase,
  SwitchStatement,
  TaggedTemplateExpression,
  TemplateElement,
  TemplateLiteral,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  TsArrayType,
  TsAsExpression,
  TsCallSignatureDeclaration,
  TsConditionalType,
  TsConstAssertion,
  TsConstructorType,
  TsConstructSignatureDeclaration,
  TsEnumDeclaration,
  TsEnumMember,
  TsExportAssignment,
  TsExpressionWithTypeArguments,
  TsExternalModuleReference,
  TsFunctionType,
  TsGetterSignature,
  TsImportEqualsDeclaration,
  TsImportType,
  TsIndexedAccessType,
  TsIndexSignature,
  TsInferType,
  TsInstantiation,
  TsInterfaceBody,
  TsInterfaceDeclaration,
  TsIntersectionType,
  TsKeywordType,
  TsLiteralType,
  TsMappedType,
  TsMethodSignature,
  TsModuleBlock,
  TsModuleDeclaration,
  TsNamespaceDeclaration,
  TsNamespaceExportDeclaration,
  TsNonNullExpression,
  TsOptionalType,
  TsParameterProperty,
  TsParenthesizedType,
  TsPropertySignature,
  TsQualifiedName,
  TsRestType,
  TsSatisfiesExpression,
  TsSetterSignature,
  TsThisType,
  TsTupleElement,
  TsTupleType,
  TsTypeAliasDeclaration,
  TsTypeAnnotation,
  TsTypeAssertion,
  TsTypeLiteral,
  TsTypeOperator,
  TsTypeParameter,
  TsTypeParameterDeclaration,
  TsTypeParameterInstantiation,
  TsTypePredicate,
  TsTypeQuery,
  TsTypeReference,
  TsUnionType,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  WithStatement,
  YieldExpression,
};

export {
  Argument,
  ClassMember,
  Expression,
  HasSpan,
  Invalid,
  Pattern,
  Span,
  Statement,
  TsType,
} from '@swc/types';
