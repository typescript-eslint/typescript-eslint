/**
 * @fileoverview Definition of AST structure.
 * @author Armano <https://github.com/armano2>
 */

export interface Position {
  line: number;
  column: number;
}

interface SourceLocation {
  source?: string | null;
  start: Position;
  end: Position;
}

export interface BaseNode {
  type: string;
  loc?: SourceLocation | null;
  range?: [number, number];
}

export interface Comment extends BaseNode {
  type: 'Line' | 'Block';
  value: string;
}

export interface ArrayExpression extends BaseNode {
  type: 'ArrayExpression';
  elements: Array<Expressions | Identifier | Literals | SpreadElement | null>;
}

export interface ArrayPattern extends BaseNode {
  type: 'ArrayPattern';
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
  type: 'ArrowFunctionExpression';
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
  type: 'AssignmentExpression';
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
  type: 'AssignmentPattern';
  right: Expressions | Identifier | Literals;
  left: ArrayPattern | Identifier | ObjectPattern;
}

export interface AwaitExpression extends BaseNode {
  type: 'AwaitExpression';
  argument: Expressions | Identifier | Literal;
}

export interface BigIntLiteral extends BaseNode {
  type: 'BigIntLiteral';
  value: string;
  raw: string;
}

export interface BinaryExpression extends BaseNode {
  type: 'BinaryExpression';
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
  type: 'BlockStatement';
  body: Array<Declarations | Statements>;
}

export interface BreakStatement extends BaseNode {
  type: 'BreakStatement';
  label: null | Identifier;
}

export interface CallExpression extends BaseNode {
  type: 'CallExpression';
  typeParameters?: TSTypeParameterInstantiation;
  callee: Expressions | Identifier | Import | Literals | Super;
  arguments: Array<Expressions | Identifier | Literals | SpreadElement>;
}

export interface CatchClause extends BaseNode {
  type: 'CatchClause';
  param: null | ArrayPattern | Identifier | ObjectPattern;
  body: BlockStatement;
}

export interface ClassBody extends BaseNode {
  type: 'ClassBody';
  body: Array<
    | ClassProperty
    | MethodDefinition
    | TSAbstractClassProperty
    | TSAbstractMethodDefinition
    | TSIndexSignature
  >;
}

export interface ClassDeclaration extends BaseNode {
  type: 'ClassDeclaration';
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  superTypeParameters?: TSTypeParameterInstantiation;
  superClass: null | Expressions | Identifier | Literal;
  implements?: Array<TSClassImplements>;
  id: null | Identifier;
  decorators?: Array<Decorator>;
  body: ClassBody;
}

export interface ClassExpression extends BaseNode {
  type: 'ClassExpression';
  typeParameters?: TSTypeParameterDeclaration;
  superTypeParameters?: TSTypeParameterInstantiation;
  superClass: null | Expressions | Identifier;
  implements?: Array<TSClassImplements>;
  id: null | Identifier;
  body: ClassBody;
}

export interface ClassProperty extends BaseNode {
  type: 'ClassProperty';
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

export interface ConditionalExpression extends BaseNode {
  type: 'ConditionalExpression';
  test: Expressions | Identifier | Literals;
  consequent: Expressions | Identifier | JSXElement | Literals;
  alternate: Expressions | Identifier | JSXElement | Literals;
}

export interface ContinueStatement extends BaseNode {
  type: 'ContinueStatement';
  label: null | Identifier;
}

export interface DebuggerStatement extends BaseNode {
  type: 'DebuggerStatement';
}

export interface Decorator extends BaseNode {
  type: 'Decorator';
  expression: Expressions | Identifier;
}

export interface DoWhileStatement extends BaseNode {
  type: 'DoWhileStatement';
  test: Expressions | Identifier | Literal;
  body: BlockStatement | VariableDeclaration;
}

export interface EmptyStatement extends BaseNode {
  type: 'EmptyStatement';
}

export interface ExportAllDeclaration extends BaseNode {
  type: 'ExportAllDeclaration';
  source: Identifier | Literal;
}

export interface ExportDefaultDeclaration extends BaseNode {
  type: 'ExportDefaultDeclaration';
  declaration: Declarations | Expressions | Identifier | JSXElement | Literal;
}

export interface ExportNamedDeclaration extends BaseNode {
  type: 'ExportNamedDeclaration';
  specifiers: Array<ExportSpecifier>;
  source: null | Literal;
  declaration: null | Declarations;
}

export interface ExportSpecifier extends BaseNode {
  type: 'ExportSpecifier';
  local: Identifier;
  exported: Identifier;
}

export interface ExpressionStatement extends BaseNode {
  type: 'ExpressionStatement';
  directive?: string;
  expression: Expressions | Identifier | JSXElement | JSXFragment | Literals;
}

export interface ForInStatement extends BaseNode {
  type: 'ForInStatement';
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
  type: 'ForOfStatement';
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
  type: 'ForStatement';
  update: null | Expressions | Identifier;
  test: null | Expressions | Identifier | Literal;
  init: null | Expressions | Identifier | VariableDeclaration;
  body: Statements | VariableDeclaration;
}

export interface FunctionDeclaration extends BaseNode {
  type: 'FunctionDeclaration';
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
  body: BlockStatement;
}

export interface FunctionExpression extends BaseNode {
  type: 'FunctionExpression';
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
  type: 'Identifier';
  optional?: boolean;
  name: string;
  typeAnnotation?: TSTypeAnnotation;
  decorators?: Array<Decorator>;
}

export interface IfStatement extends BaseNode {
  type: 'IfStatement';
  test: Expressions | Identifier | Literal;
  consequent: Statements | VariableDeclaration;
  alternate: null | Statements | VariableDeclaration;
}

export interface Import extends BaseNode {
  type: 'Import';
}

export interface ImportDeclaration extends BaseNode {
  type: 'ImportDeclaration';
  specifiers: Array<
    ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier
  >;
  source: Literal;
}

export interface ImportDefaultSpecifier extends BaseNode {
  type: 'ImportDefaultSpecifier';
  local: Identifier;
}

export interface ImportNamespaceSpecifier extends BaseNode {
  type: 'ImportNamespaceSpecifier';
  local: Identifier;
}

export interface ImportSpecifier extends BaseNode {
  type: 'ImportSpecifier';
  local: Identifier;
  imported: Identifier;
}

export interface JSXAttribute extends BaseNode {
  type: 'JSXAttribute';
  value: null | JSXExpressionContainer | Literal;
  name: JSXIdentifier;
}

export interface JSXClosingElement extends BaseNode {
  type: 'JSXClosingElement';
  name: JSXIdentifier | JSXMemberExpression;
}

export interface JSXClosingFragment extends BaseNode {
  type: 'JSXClosingFragment';
}

export interface JSXElement extends BaseNode {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  closingElement: null | JSXClosingElement;
  children: Array<
    JSXElement | JSXExpressionContainer | JSXFragment | JSXSpreadChild | JSXText
  >;
}

export interface JSXEmptyExpression extends BaseNode {
  type: 'JSXEmptyExpression';
}

export interface JSXExpressionContainer extends BaseNode {
  type: 'JSXExpressionContainer';
  expression:
    | Expressions
    | Identifier
    | JSXElement
    | JSXEmptyExpression
    | Literal;
}

export interface JSXFragment extends BaseNode {
  type: 'JSXFragment';
  openingFragment: JSXOpeningFragment;
  closingFragment: JSXClosingFragment;
  children: Array<JSXElement | JSXFragment | JSXText>;
}

export interface JSXIdentifier extends BaseNode {
  type: 'JSXIdentifier';
  name: string;
}

export interface JSXMemberExpression extends BaseNode {
  type: 'JSXMemberExpression';
  property: JSXIdentifier;
  object: JSXIdentifier | JSXMemberExpression | MemberExpression;
}

export interface JSXOpeningElement extends BaseNode {
  type: 'JSXOpeningElement';
  selfClosing: boolean;
  typeParameters?: TSTypeParameterInstantiation;
  name: JSXIdentifier | JSXMemberExpression;
  attributes: Array<JSXAttribute | JSXSpreadAttribute>;
}

export interface JSXOpeningFragment extends BaseNode {
  type: 'JSXOpeningFragment';
}

export interface JSXSpreadAttribute extends BaseNode {
  type: 'JSXSpreadAttribute';
  argument: Expressions | Identifier;
}

export interface JSXSpreadChild extends BaseNode {
  type: 'JSXSpreadChild';
  expression: Expressions | JSXElement;
}

export interface JSXText extends BaseNode {
  type: 'JSXText';
  value: string;
  raw: string;
}

export interface LabeledStatement extends BaseNode {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statements | VariableDeclaration;
}

export interface Literal extends BaseNode {
  type: 'Literal';
  value: boolean | null | number | string;
  raw: string;
  regex?: {
    pattern: string;
    flags: string;
  };
}

export interface LogicalExpression extends BaseNode {
  type: 'LogicalExpression';
  operator: '&&' | '||';
  right: Expressions | Identifier | Literal;
  left: Expressions | Identifier | Literal;
}

export interface MemberExpression extends BaseNode {
  type: 'MemberExpression';
  computed: boolean;
  property: Expressions | Identifier | Literals;
  object: Expressions | Identifier | Literals | Super;
}

export interface MetaProperty extends BaseNode {
  type: 'MetaProperty';
  property: Identifier;
  meta: Identifier;
}

export interface MethodDefinition extends BaseNode {
  type: 'MethodDefinition';
  static: boolean;
  kind: 'constructor' | 'get' | 'method' | 'set';
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  value: FunctionExpression;
  key: Expressions | Identifier | Literals;
  decorators?: Array<Decorator>;
}

export interface NewExpression extends BaseNode {
  type: 'NewExpression';
  typeParameters?: TSTypeParameterInstantiation;
  callee: Expressions | Identifier | Super | TemplateLiteral;
  arguments: Array<Expressions | Identifier | Literals | SpreadElement>;
}

export interface ObjectExpression extends BaseNode {
  type: 'ObjectExpression';
  properties: Array<Property | SpreadElement>;
}

export interface ObjectPattern extends BaseNode {
  type: 'ObjectPattern';
  optional?: boolean;
  typeAnnotation?: TSTypeAnnotation;
  properties: Array<Property | RestElement>;
}

export interface Program extends BaseNode {
  type: 'Program';
  sourceType: 'module' | 'script';
  body: Array<Declarations | Statements | TSNamespaceExportDeclaration>;
}

export interface Property extends BaseNode {
  type: 'Property';
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
  type: 'RestElement';
  optional?: boolean;
  typeAnnotation?: TSTypeAnnotation;
  decorators?: Array<Decorator>;
  argument: ArrayPattern | AssignmentPattern | Identifier | ObjectPattern;
}

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement';
  argument:
    | null
    | Expressions
    | Identifier
    | JSXElement
    | JSXFragment
    | Literals;
}

export interface SequenceExpression extends BaseNode {
  type: 'SequenceExpression';
  expressions: Array<Expressions | Identifier | JSXElement | Literals>;
}

export interface SpreadElement extends BaseNode {
  type: 'SpreadElement';
  argument: Expressions | Identifier;
}

export interface Super extends BaseNode {
  type: 'Super';
}

export interface SwitchCase extends BaseNode {
  type: 'SwitchCase';
  test: null | Expressions | Identifier | Literals;
  consequent: Array<Declarations | Statements>;
}

export interface SwitchStatement extends BaseNode {
  type: 'SwitchStatement';
  discriminant: Expressions | Identifier | Literals;
  cases: Array<SwitchCase>;
}

export interface TaggedTemplateExpression extends BaseNode {
  type: 'TaggedTemplateExpression';
  typeParameters?: TSTypeParameterInstantiation;
  tag: Identifier | MemberExpression | TemplateLiteral;
  quasi: TemplateLiteral;
}

export interface TemplateElement extends BaseNode {
  type: 'TemplateElement';
  tail: boolean;
  value: {
    raw: string;
    cooked: string;
  };
}

export interface TemplateLiteral extends BaseNode {
  type: 'TemplateLiteral';
  quasis: Array<TemplateElement>;
  expressions: Array<Expressions | Identifier | Literals>;
}

export interface ThisExpression extends BaseNode {
  type: 'ThisExpression';
}

export interface ThrowStatement extends BaseNode {
  type: 'ThrowStatement';
  argument: null | Expressions | Identifier | Literal;
}

export interface TryStatement extends BaseNode {
  type: 'TryStatement';
  handler: null | CatchClause;
  finalizer: null | BlockStatement;
  block: BlockStatement;
}

export interface UnaryExpression extends BaseNode {
  type: 'UnaryExpression';
  prefix: boolean;
  operator: '!' | '+' | '-' | 'delete' | 'typeof' | 'void' | '~';
  argument: Expressions | Identifier | Literals;
}

export interface UpdateExpression extends BaseNode {
  type: 'UpdateExpression';
  prefix: boolean;
  operator: '++' | '--';
  argument: Expressions | Identifier | Literal;
}

export interface VariableDeclaration extends BaseNode {
  type: 'VariableDeclaration';
  kind: 'const' | 'let' | 'var';
  declare?: boolean;
  declarations: Array<VariableDeclarator>;
}

export interface VariableDeclarator extends BaseNode {
  type: 'VariableDeclarator';
  definite?: boolean;
  init: null | Expressions | Identifier | JSXElement | Literals;
  id: ArrayPattern | Identifier | ObjectPattern;
}

export interface WhileStatement extends BaseNode {
  type: 'WhileStatement';
  test: Expressions | Identifier | Literals;
  body: Statements | VariableDeclaration;
}

export interface WithStatement extends BaseNode {
  type: 'WithStatement';
  object: Expressions | Identifier | Literal;
  body: Statements | VariableDeclaration;
}

export interface YieldExpression extends BaseNode {
  type: 'YieldExpression';
  delegate: boolean;
  argument: null | Expressions | Identifier | Literals;
}

export interface TSAbstractClassDeclaration extends BaseNode {
  type: 'TSAbstractClassDeclaration';
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  superTypeParameters?: TSTypeParameterInstantiation;
  superClass: null | Identifier;
  implements?: Array<TSClassImplements>;
  id: null | Identifier;
  body: ClassBody;
}

export interface TSAbstractClassProperty extends BaseNode {
  type: 'TSAbstractClassProperty';
  static: boolean;
  readonly?: boolean;
  optional?: boolean;
  definite: boolean;
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  value: null;
  typeAnnotation?: TSTypeAnnotation;
  key: Identifier;
}

export interface TSAbstractMethodDefinition extends BaseNode {
  type: 'TSAbstractMethodDefinition';
  static: boolean;
  kind: 'constructor' | 'get' | 'method' | 'set';
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  value: FunctionExpression;
  key: Identifier;
}

export interface TSArrayType extends BaseNode {
  type: 'TSArrayType';
  elementType: TSTypeKeywords | TSTypeOperators;
}

export interface TSAsExpression extends BaseNode {
  type: 'TSAsExpression';
  typeAnnotation: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  expression: Expressions | Identifier | JSXElement | Literals;
}

export interface TSCallSignatureDeclaration extends BaseNode {
  type: 'TSCallSignatureDeclaration';
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<Identifier | ObjectPattern | RestElement>;
}

export interface TSClassImplements extends BaseNode {
  type: 'TSClassImplements';
  typeParameters?: TSTypeParameterInstantiation;
  expression: Identifier | MemberExpression;
}

export interface TSConditionalType extends BaseNode {
  type: 'TSConditionalType';
  trueType: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  falseType: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  extendsType: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  checkType: TSTypeKeywords | TSTypeOperators;
}

export interface TSConstructSignatureDeclaration extends BaseNode {
  type: 'TSConstructSignatureDeclaration';
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<Identifier | ObjectPattern | RestElement | TSParameterProperty>;
}

export interface TSConstructorType extends BaseNode {
  type: 'TSConstructorType';
  typeParameters?: TSTypeParameterDeclaration;
  returnType: TSTypeAnnotation;
  params: Array<ArrayPattern | Identifier | RestElement>;
}

export interface TSDeclareFunction extends BaseNode {
  type: 'TSDeclareFunction';
  generator: boolean;
  expression: boolean;
  declare?: boolean;
  async: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<
    ArrayPattern | AssignmentPattern | Identifier | ObjectPattern | RestElement
  >;
  id: Identifier;
  body?: BlockStatement;
}

export interface TSEnumDeclaration extends BaseNode {
  type: 'TSEnumDeclaration';
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
  type: 'TSEnumMember';
  initializer?: Expressions | Identifier | Literal;
  id: Identifier | Literal;
}

export interface TSExportAssignment extends BaseNode {
  type: 'TSExportAssignment';
  expression: Expressions | Identifier | Literal;
}

export interface TSExternalModuleReference extends BaseNode {
  type: 'TSExternalModuleReference';
  expression: Identifier | Literal;
}

export interface TSFunctionType extends BaseNode {
  type: 'TSFunctionType';
  typeParameters?: TSTypeParameterDeclaration;
  returnType: TSTypeAnnotation;
  params: Array<
    | ArrayPattern
    | AssignmentPattern
    | Identifier
    | ObjectPattern
    | RestElement
    | TSParameterProperty
  >;
}

export interface TSImportEqualsDeclaration extends BaseNode {
  type: 'TSImportEqualsDeclaration';
  isExport: boolean;
  moduleReference: Identifier | TSExternalModuleReference | TSQualifiedName;
  id: Identifier;
}

export interface TSImportType extends BaseNode {
  type: 'TSImportType';
  isTypeOf: boolean;
  typeParameters: null | TSTypeParameterInstantiation;
  qualifier: null | Identifier;
  parameter: TSLiteralType;
}

export interface TSIndexSignature extends BaseNode {
  type: 'TSIndexSignature';
  static?: boolean;
  readonly?: boolean;
  export?: boolean;
  accessibility?: 'private' | 'public';
  typeAnnotation: null | TSTypeAnnotation;
  parameters: Array<
    AssignmentPattern | Identifier | RestElement | TSParameterProperty
  >;
}

export interface TSIndexedAccessType extends BaseNode {
  type: 'TSIndexedAccessType';
  objectType: TSTypeOperators | TSAnyKeyword;
  indexType: TSLiteralType | TSTypeOperators | TSNeverKeyword;
}

export interface TSInferType extends BaseNode {
  type: 'TSInferType';
  typeParameter: TSTypeParameter;
}

export interface TSInterfaceBody extends BaseNode {
  type: 'TSInterfaceBody';
  body: Array<TSSignatures>;
}

export interface TSInterfaceDeclaration extends BaseNode {
  type: 'TSInterfaceDeclaration';
  declare?: boolean;
  abstract?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  implements?: Array<TSInterfaceHeritage>;
  id: Identifier;
  extends?: Array<TSInterfaceHeritage>;
  decorators?: Array<Decorator>;
  body: TSInterfaceBody;
}

export interface TSInterfaceHeritage extends BaseNode {
  type: 'TSInterfaceHeritage';
  typeParameters?: TSTypeParameterInstantiation;
  expression: Expressions | Identifier;
}

export interface TSIntersectionType extends BaseNode {
  type: 'TSIntersectionType';
  types: Array<TSThisType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSLiteralType extends BaseNode {
  type: 'TSLiteralType';
  literal: Literals | UnaryExpression;
}

export interface TSMappedType extends BaseNode {
  type: 'TSMappedType';
  readonly?: boolean | '+';
  optional?: boolean | '-';
  typeParameter: TSTypeParameter;
  typeAnnotation?: TSLiteralType | TSTypeKeywords | TSTypeOperators;
}

export interface TSMethodSignature extends BaseNode {
  type: 'TSMethodSignature';
  optional?: boolean;
  computed: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  returnType?: TSTypeAnnotation;
  params: Array<
    ArrayPattern | AssignmentPattern | Identifier | ObjectPattern | RestElement
  >;
  key: Expressions | Identifier | Literal;
}

export interface TSModuleBlock extends BaseNode {
  type: 'TSModuleBlock';
  body: Array<Declarations | Statements>;
}

export interface TSModuleDeclaration extends BaseNode {
  type: 'TSModuleDeclaration';
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
  type: 'TSNamespaceExportDeclaration';
  id: Identifier;
}

export interface TSNonNullExpression extends BaseNode {
  type: 'TSNonNullExpression';
  expression: Expressions | Identifier | Literal;
}

export interface TSOptionalType extends BaseNode {
  type: 'TSOptionalType';
  typeAnnotation: TSStringKeyword;
}

export interface TSParameterProperty extends BaseNode {
  type: 'TSParameterProperty';
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
  type: 'TSParenthesizedType';
  typeAnnotation: TSLiteralType | TSTypeOperators;
}

export interface TSPropertySignature extends BaseNode {
  type: 'TSPropertySignature';
  readonly?: boolean;
  optional?: boolean;
  computed: boolean;
  accessibility?: 'private' | 'protected' | 'public';
  typeAnnotation?: TSTypeAnnotation;
  key: Expressions | Identifier | Literal;
  initializer?: Literal;
}

export interface TSQualifiedName extends BaseNode {
  type: 'TSQualifiedName';
  right: Identifier;
  left: Identifier | TSQualifiedName;
}

export interface TSRestType extends BaseNode {
  type: 'TSRestType';
  typeAnnotation: TSTypeOperators;
}

export interface TSThisType extends BaseNode {
  type: 'TSThisType';
}

export interface TSTupleType extends BaseNode {
  type: 'TSTupleType';
  elementTypes: Array<TSLiteralType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSTypeAliasDeclaration extends BaseNode {
  type: 'TSTypeAliasDeclaration';
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  typeAnnotation: TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators;
  id: Identifier;
}

export interface TSTypeAnnotation extends BaseNode {
  type: 'TSTypeAnnotation';
  typeAnnotation: TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators;
}

export interface TSTypeAssertion extends BaseNode {
  type: 'TSTypeAssertion';
  typeAnnotation: TSTypeKeywords | TSTypeOperators;
  expression: Expressions | Identifier | Literals;
}

export interface TSTypeLiteral extends BaseNode {
  type: 'TSTypeLiteral';
  members: Array<TSSignatures>;
}

export interface TSTypeOperator extends BaseNode {
  type: 'TSTypeOperator';
  operator: 'keyof' | 'unique';
  typeAnnotation: TSTypeKeywords | TSTypeOperators;
}

export interface TSTypeParameter extends BaseNode {
  type: 'TSTypeParameter';
  name: Identifier;
  default?: TSLiteralType | TSTypeKeywords | TSTypeOperators;
  constraint?: TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators;
}

export interface TSTypeParameterDeclaration extends BaseNode {
  type: 'TSTypeParameterDeclaration';
  params: Array<TSTypeParameter>;
}

export interface TSTypeParameterInstantiation extends BaseNode {
  type: 'TSTypeParameterInstantiation';
  params: Array<TSLiteralType | TSThisType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSTypePredicate extends BaseNode {
  type: 'TSTypePredicate';
  typeAnnotation: TSTypeAnnotation;
  parameterName: Identifier | TSThisType;
}

export interface TSTypeQuery extends BaseNode {
  type: 'TSTypeQuery';
  exprName: Identifier | TSQualifiedName;
}

export interface TSTypeReference extends BaseNode {
  type: 'TSTypeReference';
  typeParameters?: TSTypeParameterInstantiation;
  typeName: Identifier | TSQualifiedName;
}

export interface TSUnionType extends BaseNode {
  type: 'TSUnionType';
  types: Array<TSLiteralType | TSTypeKeywords | TSTypeOperators>;
}

export interface TSAnyKeyword extends BaseNode {
  type: 'TSAnyKeyword';
}

export interface TSAsyncKeyword extends BaseNode {
  type: 'TSAsyncKeyword';
}

export interface TSBigIntKeyword extends BaseNode {
  type: 'TSBigIntKeyword';
}

export interface TSBooleanKeyword extends BaseNode {
  type: 'TSBooleanKeyword';
}

export interface TSNeverKeyword extends BaseNode {
  type: 'TSNeverKeyword';
}

export interface TSNullKeyword extends BaseNode {
  type: 'TSNullKeyword';
}

export interface TSNumberKeyword extends BaseNode {
  type: 'TSNumberKeyword';
}

export interface TSObjectKeyword extends BaseNode {
  type: 'TSObjectKeyword';
}

export interface TSPrivateKeyword extends BaseNode {
  type: 'TSPrivateKeyword';
}

export interface TSProtectedKeyword extends BaseNode {
  type: 'TSProtectedKeyword';
}

export interface TSPublicKeyword extends BaseNode {
  type: 'TSPublicKeyword';
}

export interface TSStaticKeyword extends BaseNode {
  type: 'TSStaticKeyword';
}

export interface TSStringKeyword extends BaseNode {
  type: 'TSStringKeyword';
}

export interface TSSymbolKeyword extends BaseNode {
  type: 'TSSymbolKeyword';
}

export interface TSUndefinedKeyword extends BaseNode {
  type: 'TSUndefinedKeyword';
}

export interface TSUnknownKeyword extends BaseNode {
  type: 'TSUnknownKeyword';
}

export interface TSVoidKeyword extends BaseNode {
  type: 'TSVoidKeyword';
}

export type Declarations =
  | ClassDeclaration
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | FunctionDeclaration
  | ImportDeclaration
  | VariableDeclaration
  | TSAbstractClassDeclaration
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
