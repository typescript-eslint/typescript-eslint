interface LineAndColumnData {
  /**
   * Line number (1-indexed)
   */
  line: number;
  /**
   * Column number on the line (0-indexed)
   */
  column: number;
}

interface NodeBase {
  /**
   * The source location information of the node.
   */
  loc: {
    /**
     * The position of the first character of the parsed source region
     */
    start: LineAndColumnData;
    /**
     * The position of the first character after the parsed source region
     */
    end: LineAndColumnData;
  };
  /**
   * An array of two numbers.
   * Both numbers are a 0-based index which is the position in the array of source code characters.
   * The first is the start position of the node, the second is the end position of the node.
   */
  range: [number, number];

  // every node *will* have a type, but let the nodes define their own exact string
  // type: string;

  // we don't ever set this from within ts-estree
  // source?: string | null;
}

//////////////// NOTE - got to line 1838 ////////////////////

// ensure you sort the union members alphabetically...
type ESTreeNode = null;

//////////
// Reusable Unions
//  These are based off of types used in the Typescript AST definitions
//////////

type Accessibility = 'public' | 'protected' | 'private';
type BindingPattern = ArrayPattern | ObjectPattern;
type BindingName = BindingPattern | Identifier;
type ClassElement =
  | ClassProperty
  | FunctionExpression
  | MethodDefinition
  | TSAbstractClassProperty
  | TSAbstractMethodDefinition
  | TSIndexSignature;
type Expression = null; // TODO - get lists from ts source and convert to estree nodes
type ExpressionWithTypeArguments = TSClassImplements | TSInterfaceHeritage;
type ForInitialiser = Expression | VariableDeclaration;
type ImportClause =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier;
type JSXChild = JSXElement | JSXExpression | JSXFragment | JSXText;
type JSXExpression =
  | JSXEmptyExpression
  | JSXSpreadChild
  | JSXExpressionContainer;
type LeftHandSideExpression =
  | ArrayExpression
  | ArrayPattern
  | BigIntLiteral
  | CallExpression
  | ClassExpression
  | ClassDeclaration
  | Expression
  | FunctionExpression
  | Import
  | Literal
  | MemberExpression
  | ObjectExpression
  | ObjectPattern
  | Super
  | TaggedTemplateExpression
  | TemplateLiteral
  | ThisExpression
  | TSNonNullExpression
  | TSNullKeyword;
type ObjectLiteralElementLike =
  | MethodDefinition
  | Property
  | RestElement
  | SpreadElement
  | TSAbstractMethodDefinition;
type Parameter = AssignmentPattern | RestElement | TSParameterProperty;
type PropertyName = Identifier | Literal;
type Statement = null; // TODO - get lists from ts source and convert to estree nodes
type TSUnaryExpression =
  | AwaitExpression
  | LeftHandSideExpression
  | TSTypeAssertion
  | UnaryExpression
  | UpdateExpression;

///////////////
// Base, common types
///////////////

interface BinaryExpressionBase extends NodeBase {
  operator: string;
  left: Expression;
  right: Expression;
}

interface ClassDeclarationBase extends NodeBase {
  typeParameters: TSTypeParameterDeclaration;
  superTypeParameters: TSTypeParameterDeclaration;
  id: Identifier | undefined;
  body: ClassBody;
  superClass: LeftHandSideExpression | undefined;
  implements: ExpressionWithTypeArguments[];
  abstract?: boolean;
  declare?: boolean;
  decorators?: Decorator[];
}

interface ClassPropertyBase extends NodeBase {
  key: PropertyName;
  value: Expression;
  computed: boolean;
  static: boolean;
  readonly: boolean | undefined;
  decorators?: Decorator[];
  accessibility?: Accessibility;
  optional?: boolean;
  definite?: boolean;
  typeAnnotation?: TSTypeAnnotation;
}

interface FunctionDeclarationBase extends NodeBase {
  type: 'FunctionDeclaration';
  id: Identifier | null;
  generator: boolean;
  expression: false;
  async: boolean;
  params: Parameter[];
  body: BlockStatement | null | undefined;
  returnType?: TSTypeAnnotation;
  typeParameters?: TSTypeParameterDeclaration;
}

interface LiteralBase extends NodeBase {
  raw: boolean | number | RegExp | string | null;
  value: string;
  regex?: {
    pattern: string;
    flags: string;
  };
}

interface MethodDefinitionBase extends NodeBase {
  key: PropertyName;
  value: FunctionExpression;
  computed: boolean;
  static: boolean;
  kind: 'method' | 'get' | 'set' | 'constructor';
  decorators?: Decorator[];
  accessibility?: Accessibility;
  typeParameters?: TSTypeParameterDeclaration;
}

interface TSHeritageBase extends NodeBase {
  expression: Expression;
  typeParameters?: TSTypeParameterDeclaration;
}

interface UnaryExpressionBase extends NodeBase {
  operator: string;
  prefix: boolean;
  argument: LeftHandSideExpression | Literal | UnaryExpression;
}

///////////////
// Typescript ESTree Nodes
///////////////

interface ArrayExpression extends NodeBase {
  type: 'ArrayExpression';
  elements: Expression[];
}

interface ArrayPattern extends NodeBase {
  type: 'ArrayPattern';
  elements: Expression[];
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

interface ArrowFunctionExpression extends NodeBase {
  type: 'ArrowFunctionExpression';
  generator: false;
  id: null;
  params: Parameter[];
  body: Expression | BlockStatement;
  async: boolean;
  expression: boolean;
  returnType: TSTypeAnnotation;
  typeParameters: TSTypeParameterDeclaration;
}

interface AssignmentExpression extends BinaryExpressionBase {
  type: 'AssignmentExpression';
}

interface AssignmentPattern extends NodeBase {
  type: 'AssignmentPattern';
  left: BindingName;
  right?: Expression;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

interface AwaitExpression extends NodeBase {
  type: 'AwaitExpression';
  argument: TSUnaryExpression;
}

interface BigIntLiteral extends LiteralBase {
  type: 'BigIntLiteral';
}

interface BinaryExpression extends BinaryExpressionBase {
  type: 'BinaryExpression';
}

interface BlockStatement extends NodeBase {
  type: 'BlockStatement';
  body: Statement[];
}

interface BreakStatement extends NodeBase {
  type: 'BreakStatement';
  label: Identifier | null;
}

interface CallExpression extends NodeBase {
  type: 'CallExpression';
  callee: LeftHandSideExpression;
  arguments: Expression[];
  typeParameters?: TSTypeParameterDeclaration;
}

interface CatchClause extends NodeBase {
  type: 'CatchClause';
  param: BindingName | null;
  body: BlockStatement;
}

interface ClassBody extends NodeBase {
  type: 'ClassBody';
  body: ClassElement[];
}

interface ClassDeclaration extends ClassDeclarationBase {
  type: 'ClassDeclaration';
}

interface ClassExpression extends ClassDeclarationBase {
  type: 'ClassExpression';
}

interface ClassProperty extends ClassPropertyBase {
  type: 'ClassProperty';
}

interface ConditionalExpression extends NodeBase {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

interface ContinueStatement extends NodeBase {
  type: 'ContinueStatement';
  label: Identifier | null;
}

interface DebuggerStatement extends NodeBase {
  type: 'DebuggerStatement';
}

interface Decorator extends NodeBase {
  type: 'Decorator';
  expression: LeftHandSideExpression;
}

interface DoWhileStatement extends NodeBase {
  type: 'DoWhileStatement';
  test: Expression;
  body: Statement;
}

interface EmptyStatement extends NodeBase {
  type: 'EmptyStatement';
}

interface ExportAllDeclaration extends NodeBase {
  type: 'ExportAllDeclaration';
  source: Expression | null;
}

interface ExportDefaultDeclaration extends NodeBase {
  type: 'ExportDefaultDeclaration';
  declaration: Expression;
}

interface ExportNamedDeclaration extends NodeBase {
  type: 'ExportNamedDeclaration';
  declaration: Expression | null;
  specifiers: ExportSpecifier[];
  source: Expression | null;
}

interface ExportSpecifier extends NodeBase {
  type: 'ExportSpecifier';
  local: Identifier;
  exported: Identifier;
}

interface ExpressionStatement extends NodeBase {
  type: 'ExpressionStatement';
  expression: Expression;
}

interface ForInStatement extends NodeBase {
  type: 'ForInStatement';
  left: ForInitialiser;
  right: Expression;
  body: Statement;
}

interface ForOfStatement extends NodeBase {
  type: 'ForOfStatement';
  left: ForInitialiser;
  right: Expression;
  body: Statement;
  await: boolean;
}

interface ForStatement extends NodeBase {
  type: 'ForStatement';
  init: Expression | ForInitialiser | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

interface FunctionDeclaration extends FunctionDeclarationBase {
  type: 'FunctionDeclaration';
}

interface FunctionExpression extends FunctionDeclarationBase {
  type: 'FunctionExpression';
}

interface Identifier extends NodeBase {
  type: 'Identifier';
  name: string;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

interface IfStatement extends NodeBase {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

interface Import extends NodeBase {
  type: 'Import';
}

interface ImportDeclaration extends NodeBase {
  type: 'ImportDeclaration';
  source: Expression;
  specifiers: ImportClause[];
}

interface ImportDefaultSpecifier extends NodeBase {
  type: 'ImportDefaultSpecifier';
  local: Identifier;
}

interface ImportNamespaceSpecifier extends NodeBase {
  type: 'ImportNamespaceSpecifier';
  local: Identifier;
}

interface JSXElement extends NodeBase {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  closingElement: JSXClosingElement;
  children: JSXChild[];
}

interface JSXIdentifier extends NodeBase {
  type: 'JSXIdentifier';
  name: string;
}

interface LabeledStatement extends NodeBase {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statement;
}

interface Literal extends LiteralBase {
  type: 'Literal';
}

interface LogicalExpression extends BinaryExpressionBase {
  type: 'LogicalExpression';
}

interface MemberExpression extends NodeBase {
  type: 'MemberExpression';
  object: LeftHandSideExpression;
  property: Expression | Identifier;
  computed?: boolean;
}

interface MetaProperty extends NodeBase {
  type: 'MetaProperty';
  meta: Identifier;
  property: Identifier;
}

interface MethodDefinition extends MethodDefinitionBase {
  type: 'MethodDefinition';
}

interface NewExpression extends NodeBase {
  type: 'NewExpression';
  callee: LeftHandSideExpression;
  arguments: Expression[];
  typeParameters?: TSTypeParameterDeclaration;
}

interface ObjectExpression extends NodeBase {
  type: 'ObjectExpression';
  properties: ObjectLiteralElementLike[];
}

interface ObjectPattern extends NodeBase {
  type: 'ObjectPattern';
  properties: ObjectLiteralElementLike[];
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

interface Program extends NodeBase {
  type: 'Program';
  body: Statement[];
  sourceType: 'module' | 'script';
}

interface Property extends NodeBase {
  type: 'Property';
  key: PropertyName;
  value: Expression | AssignmentPattern | BindingName; // TODO
  computed: boolean;
  method: boolean;
  shorthand: boolean;
  kind: 'init';
}

interface RestElement extends NodeBase {
  type: 'RestElement';
  argument: BindingName | Expression | PropertyName;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

interface ReturnStatement extends NodeBase {
  type: 'ReturnStatement';
  argument: Expression | null;
}

interface SequenceExpression extends NodeBase {
  type: 'SequenceExpression';
  expressions: Expression[];
}

interface SpreadElement extends NodeBase {
  type: 'SpreadElement';
  argument: BindingName | Expression | PropertyName;
}

interface Super extends NodeBase {
  type: 'Super';
}

interface SwitchCase extends NodeBase {
  type: 'SwitchCase';
  test: Expression;
  consequent: Statement[];
}

interface SwitchStatement extends NodeBase {
  type: 'SwitchStatement';
  discriminant: Expression;
  cases: SwitchCase[];
}

interface TaggedTemplateExpression extends NodeBase {
  type: 'TaggedTemplateExpression';
  typeParameters: TSTypeParameterDeclaration;
  tag: LeftHandSideExpression;
  quasi: TemplateLiteral;
}

interface TemplateElement extends NodeBase {
  type: 'TemplateElement';
  value: {
    raw: string;
    cooked: string;
  };
  tail: boolean;
}

interface TemplateLiteral extends NodeBase {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

interface ThrowStatement extends NodeBase {
  type: 'ThrowStatement';
  argument: Statement | null;
}

interface TryStatement extends NodeBase {
  type: 'TryStatement';
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement;
}

interface TSAbstractClassProperty extends ClassPropertyBase {
  type: 'TSAbstractClassProperty';
}

interface TSAbstractMethodDefinition extends MethodDefinitionBase {
  type: 'TSAbstractMethodDefinition';
}

interface TSClassImplements extends TSHeritageBase {
  type: 'TSClassImplements';
}

interface TSDeclareFunction extends NodeBase {
  type: 'TSDeclareFunction';
  id: Identifier | null;
  generator: boolean;
  expression: false;
  async: boolean;
  params: Parameter;
  body: BlockStatement | null | undefined;
  returnType?: TSTypeAnnotation;
  declare: true;
  typeParameters?: TSTypeParameterDeclaration;
}

interface TSExportAssignment extends NodeBase {
  type: 'TSExportAssignment';
  expression: Expression;
}

interface TSInterfaceHeritage extends TSHeritageBase {
  type: 'TSInterfaceHeritage';
}

interface TSModuleBlock extends NodeBase {
  type: 'TSModuleBlock';
  body: Statement[];
}

interface TSNullKeyword extends NodeBase {
  type: 'TSNullKeyword';
}

interface TSParameterProperty extends NodeBase {
  type: 'TSParameterProperty';
  accessibility: Accessibility | undefined;
  readonly: boolean | undefined;
  static: boolean | undefined;
  export: boolean | undefined;
  parameter: AssignmentPattern | BindingName | RestElement;
}

interface TSTypeOperator extends NodeBase {
  type: 'TSTypeOperator';
  operator: 'keyof' | 'unique';
  typeAnnotation?: TSTypeAnnotation;
}

interface TSTypeParameterDeclaration extends NodeBase {
  type: 'TSTypeParameterDeclaration';
  params: TSTypeParameter[];
}

interface UpdateExpression extends UnaryExpressionBase {
  type: 'UpdateExpression';
}

interface UnaryExpression extends UnaryExpressionBase {
  type: 'UnaryExpression';
}

interface VariableDeclaration extends NodeBase {
  type: 'VariableDeclaration';
  declarations: VariableDeclarator[];
  kind: 'let' | 'const' | 'var';
  declare?: boolean;
}

interface VariableDeclarator extends NodeBase {
  type: 'VariableDeclarator';
  id: BindingName;
  init: Expression | null;
  definite?: boolean;
}

interface WhileStatement extends NodeBase {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

interface WithStatement extends NodeBase {
  type: 'WithStatement';
  object: Expression;
  body: Statement;
}

interface YieldExpression extends NodeBase {
  type: 'YieldExpression';
  delegate: boolean;
  argument?: Expression;
}
