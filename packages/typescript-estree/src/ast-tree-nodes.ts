/**
 * @fileoverview Definition of AST structure.
 * @author Armano <https://github.com/armano2>
 */
/* eslint-disable @typescript-eslint/array-type */

import { AST_NODE_TYPES } from './ast-node-types';

export interface Position {
  line: number;
  column: number;
}

export interface SourceLocation {
  source?: string | null;
  start: Position;
  end: Position;
}

/**
 * TODO: loc and range should be optional, but its not supported yet by covert
 */
export interface BaseNode {
  type: string;
  loc?: SourceLocation | null;
  range?: [number, number];
}

export interface Token extends BaseNode {
  type: AST_NODE_TYPES;
  value: string;
  regex?: {
    pattern: string;
    flags: string;
  };
  object?: any;
  property?: any;
  name?: any;
}

export interface Comment extends BaseNode {
  type: 'Line' | 'Block';
  value: string;
}

export interface ArrayExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrayExpression;
  elements: Array<Expressions | Identifier | Literals | SpreadElement | null>;
}

export interface ArrayPattern extends BaseNode {
  type: AST_NODE_TYPES.ArrayPattern;
  optional?: boolean;
  typeAnnotation?: TSTypeAnnotation;
  elements: Array<
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | MemberExpression
    | ObjectPattern
    | RestElement
    | null
  >;
}

export interface ArrowFunctionExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrowFunctionExpression;
  generator: boolean;
  expression: boolean;
  async: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | ObjectPattern
    | RestElement
    | TSParameterProperty
  >;
  id: null;
  body: BlockStatement | Expressions | Identifier | JSXElement | Literals;
}

export interface AssignmentExpression extends BaseNode {
  type: AST_NODE_TYPES.AssignmentExpression;
  operator:
    | '%='
    | '&='
    | '**='
    | '*='
    | '+='
    | '-='
    | '/='
    | '<<='
    | '='
    | '>>='
    | '>>>='
    | '^='
    | '|=';
  right: Expressions | Identifier | JSXElement | Literals;
  left: ArrayPattern | Expressions | Identifier | Literal | ObjectPattern;
}

export interface AssignmentPattern extends BaseNode {
  type: AST_NODE_TYPES.AssignmentPattern;
  right: Expressions | Identifier | Literals;
  left: ArrayPattern | Identifier | ObjectPattern;
}

export interface AwaitExpression extends BaseNode {
  type: AST_NODE_TYPES.AwaitExpression;
  argument: Expressions | Identifier | Literal;
}

export interface BigIntLiteral extends BaseNode {
  type: AST_NODE_TYPES.BigIntLiteral;
  value: string;
  raw: string;
}

export interface BinaryExpression extends BaseNode {
  type: AST_NODE_TYPES.BinaryExpression;
  operator:
    | '!='
    | '!=='
    | '%'
    | '&'
    | '*'
    | '**'
    | '+'
    | '-'
    | '/'
    | '<'
    | '<<'
    | '<='
    | '=='
    | '==='
    | '>'
    | '>='
    | '>>'
    | '>>>'
    | '^'
    | 'in'
    | 'instanceof'
    | '|';
  right: Expressions | Identifier | Literals;
  left: Expressions | Identifier | Literals;
}

export interface BlockStatement extends BaseNode {
  type: AST_NODE_TYPES.BlockStatement;
  body: Array<Declarations | Statements>;
}

export interface BreakStatement extends BaseNode {
  type: AST_NODE_TYPES.BreakStatement;
  label: null | Identifier;
}

export interface CallExpression extends BaseNode {
  type: AST_NODE_TYPES.CallExpression;
  typeParameters?: TSTypeParameterInstantiation;
  callee: Expressions | Identifier | Import | Literals | Super;
  arguments: Array<Expressions | Identifier | Literals | SpreadElement>;
}

export interface CatchClause extends BaseNode {
  type: AST_NODE_TYPES.CatchClause;
  param: null | ArrayPattern | Identifier | ObjectPattern;
  body: BlockStatement;
}

export interface ClassBody extends BaseNode {
  type: AST_NODE_TYPES.ClassBody;
  body: Array<
    | ClassProperty
    | MethodDefinition
    | TSAbstractClassProperty
    | TSIndexSignature
  >;
}

export interface ClassLikeNode extends BaseNode {
  type: AST_NODE_TYPES.ClassDeclaration | AST_NODE_TYPES.ClassExpression;
  id: null | Identifier;
  declare?: boolean;
  abstract?: boolean;
  body: ClassBody;
  decorators?: Array<Decorator>;
  superClass: null | Expressions | Identifier | Literal;
  superTypeParameters?: TSTypeParameterInstantiation;
  typeParameters?: TSTypeParameterDeclaration;
  implements?: Array<TSClassImplements>;
}

export interface ClassDeclaration extends ClassLikeNode {
  type: AST_NODE_TYPES.ClassDeclaration;
}

export interface ClassExpression extends ClassLikeNode {
  type: AST_NODE_TYPES.ClassExpression;
}

export interface ClassPropertyLikeNode extends BaseNode {
  type: AST_NODE_TYPES.ClassProperty | AST_NODE_TYPES.TSAbstractClassProperty;
  static: boolean;
  readonly?: boolean;
  optional?: boolean;
  definite?: boolean;
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  value: null | Expressions | Identifier | Literal;
  typeAnnotation?: TSTypeAnnotation;
  key: Expressions | Identifier | Literals;
  decorators?: Array<Decorator>;
}

export interface ClassProperty extends ClassPropertyLikeNode {
  type: AST_NODE_TYPES.ClassProperty;
}

export interface TSAbstractClassProperty extends ClassPropertyLikeNode {
  type: AST_NODE_TYPES.TSAbstractClassProperty;
}

export interface ConditionalExpression extends BaseNode {
  type: AST_NODE_TYPES.ConditionalExpression;
  test: Expressions | Identifier | Literals;
  consequent: Expressions | Identifier | JSXElement | Literals;
  alternate: Expressions | Identifier | JSXElement | Literals;
}

export interface ContinueStatement extends BaseNode {
  type: AST_NODE_TYPES.ContinueStatement;
  label: null | Identifier;
}

export interface DebuggerStatement extends BaseNode {
  type: AST_NODE_TYPES.DebuggerStatement;
}

export interface Decorator extends BaseNode {
  type: AST_NODE_TYPES.Decorator;
  expression: Expressions | Identifier;
}

export interface DoWhileStatement extends BaseNode {
  type: AST_NODE_TYPES.DoWhileStatement;
  test: Expressions | Identifier | Literal;
  body: BlockStatement | VariableDeclaration;
}

export interface EmptyStatement extends BaseNode {
  type: AST_NODE_TYPES.EmptyStatement;
}

export interface ExportAllDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportAllDeclaration;
  source: Identifier | Literal;
}

export interface ExportDefaultDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportDefaultDeclaration;
  declaration:
    | null
    | Declarations
    | Expressions
    | Identifier
    | JSXElement
    | Literal;
}

export interface ExportNamedDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportNamedDeclaration;
  specifiers: Array<ExportSpecifier>;
  source: null | Literal;
  declaration:
    | null
    | Declarations
    | Expressions
    | Identifier
    | JSXElement
    | Literal;
}

export interface ExportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ExportSpecifier;
  local: Identifier;
  exported: Identifier;
}

export interface ExpressionStatement extends BaseNode {
  type: AST_NODE_TYPES.ExpressionStatement;
  directive?: string;
  expression: Expressions | Identifier | JSXElement | JSXFragment | Literals;
}

export interface ForInStatement extends BaseNode {
  type: AST_NODE_TYPES.ForInStatement;
  right: Expressions | Identifier | Literal;
  left:
    | AssignmentPattern
    | Expressions
    | Identifier
    | ObjectPattern
    | VariableDeclaration;
  body: Statements | VariableDeclaration;
}

export interface ForOfStatement extends BaseNode {
  type: AST_NODE_TYPES.ForOfStatement;
  await: boolean;
  right: Expressions | Identifier | Literal;
  left:
    | ArrayPattern
    | Expressions
    | Identifier
    | ObjectPattern
    | VariableDeclaration;
  body: Statements;
}

export interface ForStatement extends BaseNode {
  type: AST_NODE_TYPES.ForStatement;
  update: null | Expressions | Identifier;
  test: null | Expressions | Identifier | Literal;
  init: null | Expressions | Identifier | VariableDeclaration;
  body: Statements | VariableDeclaration;
}

export interface FunctionDeclarationLike extends BaseNode {
  generator: boolean;
  expression: boolean;
  async: boolean;
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | ObjectPattern
    | RestElement
    | TSParameterProperty
  >;
  id: null | Identifier;
  body?: BlockStatement;
}

export interface FunctionDeclaration extends FunctionDeclarationLike {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
}

export interface FunctionExpression extends BaseNode {
  type: AST_NODE_TYPES.FunctionExpression;
  generator: boolean;
  expression: boolean;
  async: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | ObjectPattern
    | RestElement
    | TSParameterProperty
  >;
  id: null | Identifier;
  body: null | BlockStatement;
}

export interface Identifier extends BaseNode {
  type: AST_NODE_TYPES.Identifier;
  optional?: boolean;
  name: string;
  typeAnnotation?: TSTypeAnnotation;
  decorators?: Array<Decorator>;
}

export interface IfStatement extends BaseNode {
  type: AST_NODE_TYPES.IfStatement;
  test: Expressions | Identifier | Literal;
  consequent: Statements | VariableDeclaration;
  alternate: null | Statements | VariableDeclaration;
}

export interface Import extends BaseNode {
  type: AST_NODE_TYPES.Import;
}

export interface ImportDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ImportDeclaration;
  specifiers: Array<
    ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier
  >;
  source: Literal;
}

export interface ImportDefaultSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportDefaultSpecifier;
  local: Identifier;
}

export interface ImportNamespaceSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportNamespaceSpecifier;
  local: Identifier;
}

export interface ImportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportSpecifier;
  local: Identifier;
  imported: Identifier;
}

export interface JSXAttribute extends BaseNode {
  type: AST_NODE_TYPES.JSXAttribute;
  value: null | JSXExpressionContainer | Literal;
  name: JSXIdentifier;
}

export interface JSXClosingElement extends BaseNode {
  type: AST_NODE_TYPES.JSXClosingElement;
  name: JSXIdentifier | JSXMemberExpression;
}

export interface JSXClosingFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXClosingFragment;
}

export interface JSXElement extends BaseNode {
  type: AST_NODE_TYPES.JSXElement;
  openingElement: JSXOpeningElement;
  closingElement: null | JSXClosingElement;
  children: Array<
    JSXElement | JSXExpressionContainer | JSXFragment | JSXSpreadChild | JSXText
  >;
}

export interface JSXEmptyExpression extends BaseNode {
  type: AST_NODE_TYPES.JSXEmptyExpression;
}

export interface JSXExpressionContainer extends BaseNode {
  type: AST_NODE_TYPES.JSXExpressionContainer;
  expression:
    | Expressions
    | Identifier
    | JSXElement
    | JSXEmptyExpression
    | Literal;
}

export interface JSXFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXFragment;
  openingFragment: JSXOpeningFragment;
  closingFragment: JSXClosingFragment;
  children: Array<JSXElement | JSXFragment | JSXText>;
}

export interface JSXIdentifier extends BaseNode {
  type: AST_NODE_TYPES.JSXIdentifier;
  name: string;
}

export interface JSXMemberExpression extends BaseNode {
  type: AST_NODE_TYPES.JSXMemberExpression;
  property: JSXIdentifier;
  object: JSXIdentifier | JSXMemberExpression | MemberExpression;
}

export interface JSXOpeningElement extends BaseNode {
  type: AST_NODE_TYPES.JSXOpeningElement;
  selfClosing: boolean;
  typeParameters?: TSTypeParameterInstantiation;
  name: JSXIdentifier | JSXMemberExpression;
  attributes: Array<JSXAttribute | JSXSpreadAttribute>;
}

export interface JSXOpeningFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXOpeningFragment;
}

export interface JSXSpreadAttribute extends BaseNode {
  type: AST_NODE_TYPES.JSXSpreadAttribute;
  argument: Expressions | Identifier;
}

export interface JSXSpreadChild extends BaseNode {
  type: AST_NODE_TYPES.JSXSpreadChild;
  expression: Expressions | JSXElement;
}

export interface JSXText extends BaseNode {
  type: AST_NODE_TYPES.JSXText;
  value: string;
  raw: string;
}

export interface LabeledStatement extends BaseNode {
  type: AST_NODE_TYPES.LabeledStatement;
  label: Identifier;
  body: Statements | VariableDeclaration;
}

export interface Literal extends BaseNode {
  type: AST_NODE_TYPES.Literal;
  value: boolean | null | number | string | RegExp;
  raw: string;
  regex?: {
    pattern: string;
    flags: string;
  };
}

export interface LogicalExpression extends BaseNode {
  type: AST_NODE_TYPES.LogicalExpression;
  operator: '&&' | '||';
  right: Expressions | Identifier | Literal;
  left: Expressions | Identifier | Literal;
}

export interface MemberExpression extends BaseNode {
  type: AST_NODE_TYPES.MemberExpression;
  computed?: boolean;
  property: Expressions | Identifier | Literals;
  object: Expressions | Identifier | Literals | Super;
}

export interface MetaProperty extends BaseNode {
  type: AST_NODE_TYPES.MetaProperty;
  property: Identifier;
  meta: Identifier;
}

export interface MethodDefinition extends BaseNode {
  type:
    | AST_NODE_TYPES.MethodDefinition
    | AST_NODE_TYPES.TSAbstractMethodDefinition;
  static: boolean;
  kind: 'constructor' | 'get' | 'method' | 'set';
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  value: FunctionExpression;
  key: Expressions | Identifier | Literals;
  decorators?: Array<Decorator>;
}

export interface TSAbstractMethodDefinition extends MethodDefinition {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition;
}

export interface NewExpression extends BaseNode {
  type: AST_NODE_TYPES.NewExpression;
  typeParameters?: TSTypeParameterInstantiation;
  callee: Expressions | Identifier | Super | TemplateLiteral;
  arguments: Array<Expressions | Identifier | Literals | SpreadElement>;
}

export interface ObjectExpression extends BaseNode {
  type: AST_NODE_TYPES.ObjectExpression;
  properties: Array<Property | SpreadElement>;
}

export interface ObjectPattern extends BaseNode {
  type: AST_NODE_TYPES.ObjectPattern;
  optional?: boolean;
  typeAnnotation?: TSTypeAnnotation;
  properties: Array<Property | RestElement>;
}

export interface Program extends BaseNode {
  type: AST_NODE_TYPES.Program;
  sourceType: 'module' | 'script';
  body: Array<Declarations | Statements | TSNamespaceExportDeclaration>;
  tokens?: Token[];
  comments?: Comment[];
}

export interface Property extends BaseNode {
  type: AST_NODE_TYPES.Property;
  shorthand: boolean;
  method: boolean;
  kind: 'get' | 'init' | 'set';
  computed: boolean;
  value:
    | ArrayPattern
    | AssignmentPattern
    | Expressions
    | Identifier
    | Literals
    | ObjectPattern;
  typeParameters?: TSTypeParameterDeclaration;
  key: Expressions | Identifier | Literals;
}

export interface RestElement extends BaseNode {
  type: AST_NODE_TYPES.RestElement;
  optional?: boolean;
  typeAnnotation?: TSTypeAnnotation;
  decorators?: Array<Decorator>;
  argument: ArrayPattern | AssignmentPattern | Identifier | ObjectPattern;
  value?:
    | ArrayPattern
    | AssignmentPattern
    | Expressions
    | Identifier
    | Literals
    | ObjectPattern;
}

export interface ReturnStatement extends BaseNode {
  type: AST_NODE_TYPES.ReturnStatement;
  argument:
    | null
    | Expressions
    | Identifier
    | JSXElement
    | JSXFragment
    | Literals;
}

export interface SequenceExpression extends BaseNode {
  type: AST_NODE_TYPES.SequenceExpression;
  expressions: Array<Expressions | Identifier | JSXElement | Literals>;
}

export interface SpreadElement extends BaseNode {
  type: AST_NODE_TYPES.SpreadElement;
  argument: Expressions | Identifier;
}

export interface Super extends BaseNode {
  type: AST_NODE_TYPES.Super;
}

export interface SwitchCase extends BaseNode {
  type: AST_NODE_TYPES.SwitchCase;
  test: null | Expressions | Identifier | Literals;
  consequent: Array<Declarations | Statements>;
}

export interface SwitchStatement extends BaseNode {
  type: AST_NODE_TYPES.SwitchStatement;
  discriminant: Expressions | Identifier | Literals;
  cases: Array<SwitchCase>;
}

export interface TaggedTemplateExpression extends BaseNode {
  type: AST_NODE_TYPES.TaggedTemplateExpression;
  typeParameters?: TSTypeParameterInstantiation;
  tag: Identifier | MemberExpression | TemplateLiteral;
  quasi: TemplateLiteral;
}

export interface TemplateElement extends BaseNode {
  type: AST_NODE_TYPES.TemplateElement;
  tail: boolean;
  value: {
    raw: string;
    cooked: string;
  };
}

export interface TemplateLiteral extends BaseNode {
  type: AST_NODE_TYPES.TemplateLiteral;
  quasis: Array<TemplateElement>;
  expressions: Array<Expressions | Identifier | Literals>;
}

export interface ThisExpression extends BaseNode {
  type: AST_NODE_TYPES.ThisExpression;
}

export interface ThrowStatement extends BaseNode {
  type: AST_NODE_TYPES.ThrowStatement;
  argument: null | Expressions | Identifier | Literal;
}

export interface TryStatement extends BaseNode {
  type: AST_NODE_TYPES.TryStatement;
  handler: null | CatchClause;
  finalizer: null | BlockStatement;
  block: BlockStatement;
}

export interface UnaryExpression extends BaseNode {
  type: AST_NODE_TYPES.UnaryExpression;
  prefix: boolean;
  operator: '!' | '+' | '-' | 'delete' | 'typeof' | 'void' | '~';
  argument: Expressions | Identifier | Literals;
}

export interface UpdateExpression extends BaseNode {
  type: AST_NODE_TYPES.UpdateExpression;
  prefix: boolean;
  operator: '++' | '--';
  argument: Expressions | Identifier | Literal;
}

export interface VariableDeclaration extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  kind: 'const' | 'let' | 'var';
  declare?: boolean;
  declarations: Array<VariableDeclarator>;
}

export interface VariableDeclarator extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  definite?: boolean;
  init: null | Expressions | Identifier | JSXElement | Literals;
  id: ArrayPattern | Identifier | ObjectPattern;
}

export interface WhileStatement extends BaseNode {
  type: AST_NODE_TYPES.WhileStatement;
  test: Expressions | Identifier | Literals;
  body: Statements | VariableDeclaration;
}

export interface WithStatement extends BaseNode {
  type: AST_NODE_TYPES.WithStatement;
  object: Expressions | Identifier | Literal;
  body: Statements | VariableDeclaration;
}

export interface YieldExpression extends BaseNode {
  type: AST_NODE_TYPES.YieldExpression;
  delegate: boolean;
  argument: null | Expressions | Identifier | Literals;
}

export interface TSArrayType extends BaseNode {
  type: AST_NODE_TYPES.TSArrayType;
  elementType: TSTypeKeywords | TSTypeOperators;
}

export interface TSAsExpression extends BaseNode {
  type: AST_NODE_TYPES.TSAsExpression;
  typeAnnotation: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  expression: Expressions | Identifier | JSXElement | Literals;
}

export interface TSExpressionWithTypeArgumentsLike extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceHeritage | AST_NODE_TYPES.TSClassImplements;
  typeParameters?: TSTypeParameterInstantiation;
  expression: Identifier | MemberExpression | Expressions;
}

export interface TSClassImplements extends TSExpressionWithTypeArgumentsLike {
  type: AST_NODE_TYPES.TSClassImplements;
}

export interface TSInterfaceHeritage extends TSExpressionWithTypeArgumentsLike {
  type: AST_NODE_TYPES.TSInterfaceHeritage;
}

export interface TSConditionalType extends BaseNode {
  type: AST_NODE_TYPES.TSConditionalType;
  trueType: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  falseType: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  extendsType: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  checkType: TSTypeKeywords | TSTypeOperators;
}

export interface TSFunctionDeclarationLike extends BaseNode {
  type:
    | AST_NODE_TYPES.TSConstructSignatureDeclaration
    | AST_NODE_TYPES.TSConstructorType
    | AST_NODE_TYPES.TSFunctionType
    | AST_NODE_TYPES.TSCallSignatureDeclaration;
  params: Array<
    | Identifier
    | ObjectPattern
    | RestElement
    | TSParameterProperty
    | AssignmentPattern
    | ArrayPattern
  >;
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
}

export interface TSCallSignatureDeclaration extends TSFunctionDeclarationLike {
  type: AST_NODE_TYPES.TSCallSignatureDeclaration;
}

export interface TSConstructSignatureDeclaration
  extends TSFunctionDeclarationLike {
  type: AST_NODE_TYPES.TSConstructSignatureDeclaration;
}

export interface TSConstructorType extends TSFunctionDeclarationLike {
  type: AST_NODE_TYPES.TSConstructorType;
}

export interface TSFunctionType extends TSFunctionDeclarationLike {
  type: AST_NODE_TYPES.TSFunctionType;
}

export interface TSDeclareFunction extends FunctionDeclarationLike {
  type: AST_NODE_TYPES.TSDeclareFunction;
  body?: BlockStatement;
}

export interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  declare?: boolean;
  const?: boolean;
  modifiers?: Array<
    TSAsyncKeyword | TSPrivateKeyword | TSPublicKeyword | TSStaticKeyword
  >;
  members: Array<TSEnumMember>;
  id: Identifier;
  decorators?: Array<Decorator>;
}

export interface TSEnumMember extends BaseNode {
  type: AST_NODE_TYPES.TSEnumMember;
  initializer?: Expressions | Identifier | Literal;
  id: Identifier | Literal;
}

export interface TSExportAssignment extends BaseNode {
  type: AST_NODE_TYPES.TSExportAssignment;
  expression: Expressions | Identifier | Literal;
}

export interface TSExternalModuleReference extends BaseNode {
  type: AST_NODE_TYPES.TSExternalModuleReference;
  expression: Identifier | Literal;
}

export interface TSImportEqualsDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSImportEqualsDeclaration;
  isExport: boolean;
  moduleReference: Identifier | TSExternalModuleReference | TSQualifiedName;
  id: Identifier;
}

export interface TSImportType extends BaseNode {
  type: AST_NODE_TYPES.TSImportType;
  isTypeOf: boolean;
  typeParameters: null | TSTypeParameterInstantiation;
  qualifier: null | Identifier;
  parameter: TSLiteralType;
}

export interface TSIndexSignature extends BaseNode {
  type: AST_NODE_TYPES.TSIndexSignature;
  static?: boolean;
  readonly?: boolean;
  export?: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  typeAnnotation?: TSTypeAnnotation;
  parameters: Array<
    AssignmentPattern | Identifier | RestElement | TSParameterProperty
  >;
}

export interface TSIndexedAccessType extends BaseNode {
  type: AST_NODE_TYPES.TSIndexedAccessType;
  objectType: TSTypeOperators | TSAnyKeyword;
  indexType: TSLiteralType | TSTypeOperators | TSNeverKeyword;
}

export interface TSInferType extends BaseNode {
  type: AST_NODE_TYPES.TSInferType;
  typeParameter: TSTypeParameter;
}

export interface TSInterfaceBody extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceBody;
  body: Array<TSSignatures>;
}

export interface TSInterfaceDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceDeclaration;
  declare?: boolean;
  abstract?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  implements?: Array<TSInterfaceHeritage>;
  id: Identifier;
  extends?: Array<TSInterfaceHeritage>;
  decorators?: Array<Decorator>;
  body: TSInterfaceBody;
}

export interface TSIntersectionType extends BaseNode {
  type: AST_NODE_TYPES.TSIntersectionType;
  types: Array<TSThisType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSLiteralType extends BaseNode {
  type: AST_NODE_TYPES.TSLiteralType;
  literal: Literals | UnaryExpression;
}

export interface TSMappedType extends BaseNode {
  type: AST_NODE_TYPES.TSMappedType;
  readonly?: boolean | '+' | '-';
  optional?: boolean | '+' | '-';
  typeParameter: TSTypeParameter;
  typeAnnotation?: TSLiteralType | TSTypeKeywords | TSTypeOperators;
}

export interface TSMethodSignature extends BaseNode {
  type: AST_NODE_TYPES.TSMethodSignature;
  optional?: boolean;
  computed: boolean;
  readonly?: boolean;
  export?: boolean;
  static?: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | ObjectPattern
    | RestElement
    | TSParameterProperty
  >;
  key: Expressions | Identifier | Literal;
}

export interface TSModuleBlock extends BaseNode {
  type: AST_NODE_TYPES.TSModuleBlock;
  body: Array<Declarations | Statements>;
}

export interface TSModuleDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSModuleDeclaration;
  global?: boolean;
  declare?: boolean;
  modifiers?: Array<
    | TSAsyncKeyword
    | TSPrivateKeyword
    | TSProtectedKeyword
    | TSPublicKeyword
    | TSStaticKeyword
  >;
  id: Identifier | Literal;
  body?: TSModuleBlock | TSModuleDeclaration;
}

export interface TSNamespaceExportDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSNamespaceExportDeclaration;
  id: Identifier;
}

export interface TSNonNullExpression extends BaseNode {
  type: AST_NODE_TYPES.TSNonNullExpression;
  expression: Expressions | Identifier | Literal;
}

export interface TSOptionalType extends BaseNode {
  type: AST_NODE_TYPES.TSOptionalType;
  typeAnnotation: TSStringKeyword;
}

export interface TSParameterProperty extends BaseNode {
  type: AST_NODE_TYPES.TSParameterProperty;
  static?: boolean;
  readonly?: boolean;
  export?: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  parameter:
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | ObjectPattern
    | RestElement;
  decorators?: Array<Decorator>;
}

export interface TSParenthesizedType extends BaseNode {
  type: AST_NODE_TYPES.TSParenthesizedType;
  typeAnnotation: TSLiteralType | TSTypeOperators;
}

export interface TSPropertySignature extends BaseNode {
  type: AST_NODE_TYPES.TSPropertySignature;
  readonly?: boolean;
  optional?: boolean;
  static?: boolean;
  export?: boolean;
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  typeAnnotation?: TSTypeAnnotation;
  key: Expressions | Identifier | Literal;
  initializer?: Literal;
}

export interface TSQualifiedName extends BaseNode {
  type: AST_NODE_TYPES.TSQualifiedName;
  right: Identifier;
  left: Identifier | TSQualifiedName;
}

export interface TSRestType extends BaseNode {
  type: AST_NODE_TYPES.TSRestType;
  typeAnnotation: TSTypeOperators;
}

export interface TSThisType extends BaseNode {
  type: AST_NODE_TYPES.TSThisType;
}

export interface TSTupleType extends BaseNode {
  type: AST_NODE_TYPES.TSTupleType;
  elementTypes: Array<TSLiteralType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSTypeAliasDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAliasDeclaration;
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  typeAnnotation: TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators;
  id: Identifier;
}

export interface TSTypeAnnotation extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAnnotation;
  typeAnnotation: TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators;
}

export interface TSTypeAssertion extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAssertion;
  typeAnnotation: TSTypeKeywords | TSTypeOperators;
  expression: Expressions | Identifier | Literals;
}

export interface TSTypeLiteral extends BaseNode {
  type: AST_NODE_TYPES.TSTypeLiteral;
  members: Array<TSSignatures>;
}

export interface TSTypeOperator extends BaseNode {
  type: AST_NODE_TYPES.TSTypeOperator;
  operator: 'keyof' | 'unique';
  typeAnnotation: TSTypeKeywords | TSTypeOperators;
}

export interface TSTypeParameter extends BaseNode {
  type: AST_NODE_TYPES.TSTypeParameter;
  name: Identifier;
  default?: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  constraint?: TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators;
}

export interface TSTypeParameterDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSTypeParameterDeclaration;
  params: Array<TSTypeParameter>;
}

export interface TSTypeParameterInstantiation extends BaseNode {
  type: AST_NODE_TYPES.TSTypeParameterInstantiation;
  params: Array<TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSTypePredicate extends BaseNode {
  type: AST_NODE_TYPES.TSTypePredicate;
  typeAnnotation: TSTypeAnnotation;
  parameterName: Identifier | TSThisType;
}

export interface TSTypeQuery extends BaseNode {
  type: AST_NODE_TYPES.TSTypeQuery;
  exprName: Identifier | TSQualifiedName;
}

export interface TSTypeReference extends BaseNode {
  type: AST_NODE_TYPES.TSTypeReference;
  typeParameters?: TSTypeParameterInstantiation;
  typeName: Identifier | TSQualifiedName;
}

export interface TSUnionType extends BaseNode {
  type: AST_NODE_TYPES.TSUnionType;
  types: Array<TSLiteralType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSAnyKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAnyKeyword;
}

export interface TSAsyncKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAsyncKeyword;
}

export interface TSBigIntKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSBigIntKeyword;
}

export interface TSBooleanKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSBooleanKeyword;
}

export interface TSNeverKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNeverKeyword;
}

export interface TSNullKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNullKeyword;
}

export interface TSNumberKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNumberKeyword;
}

export interface TSObjectKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSObjectKeyword;
}

export interface TSPrivateKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSPrivateKeyword;
}

export interface TSProtectedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSProtectedKeyword;
}

export interface TSPublicKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSPublicKeyword;
}

export interface TSStaticKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSStaticKeyword;
}

export interface TSStringKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSStringKeyword;
}

export interface TSSymbolKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSSymbolKeyword;
}

export interface TSUndefinedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSUndefinedKeyword;
}

export interface TSUnknownKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSUnknownKeyword;
}

export interface TSVoidKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSVoidKeyword;
}

export type Declarations =
  | ClassDeclaration
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | FunctionDeclaration
  | ImportDeclaration
  | VariableDeclaration
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSExportAssignment
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration;

export type Statements =
  | ExpressionStatement
  | BlockStatement
  | EmptyStatement
  | DebuggerStatement
  | WithStatement
  | ReturnStatement
  | LabeledStatement
  | BreakStatement
  | ContinueStatement
  | IfStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement
  | ForInStatement
  | ForOfStatement;

export type Literals = TemplateLiteral | Literal | BigIntLiteral;

export type Expressions =
  | ThisExpression
  | ArrayExpression
  | ObjectExpression
  | FunctionExpression
  | ArrowFunctionExpression
  | YieldExpression
  | UnaryExpression
  | UpdateExpression
  | BinaryExpression
  | AssignmentExpression
  | LogicalExpression
  | MemberExpression
  | ConditionalExpression
  | CallExpression
  | NewExpression
  | SequenceExpression
  | TaggedTemplateExpression
  | ClassExpression
  | MetaProperty
  | AwaitExpression
  | TSAsExpression
  | TSNonNullExpression
  | TSTypeAssertion;

export type TSSignatures =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature;

export type TSTypeKeywords =
  | TSAnyKeyword
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSNeverKeyword
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSStringKeyword
  | TSSymbolKeyword
  | TSUndefinedKeyword
  | TSUnknownKeyword
  | TSVoidKeyword;

export type TSTypeOperators =
  | TSArrayType
  | TSConditionalType
  | TSConstructorType
  | TSFunctionType
  | TSImportType
  | TSIndexedAccessType
  | TSInferType
  | TSIntersectionType
  | TSMappedType
  | TSParenthesizedType
  | TSTupleType
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypePredicate
  | TSTypeQuery
  | TSTypeReference
  | TSUnionType
  | TSOptionalType
  | TSRestType;
