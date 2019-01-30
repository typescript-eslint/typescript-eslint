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

//////////
// Reusable Unions
//  These are based off of types used in the Typescript AST definitions
//  **Ensure you sort the union members alphabetically**
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
type DeclarationStatement =
  | ClassDeclaration
  | ClassExpression
  | ExportAllDeclaration
  | ExportNamedDeclaration
  | FunctionDeclaration
  | TSDeclareFunction
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSNamespaceExportDeclaration
  | TSTypeAliasDeclaration
  | TSEnumDeclaration;
type EntityName = Identifier | TSQualifiedName;
type Expression =
  | ArrowFunctionExpression
  | AssignmentExpression
  | BinaryExpression
  | ConditionalExpression
  | JSXClosingElement
  | JSXClosingFragment
  | JSXExpressionContainer
  | JSXOpeningElement
  | JSXOpeningFragment
  | JSXSpreadChild
  | LogicalExpression
  | RestElement
  | SequenceExpression
  | SpreadElement
  | TSAsExpression
  | TSUnaryExpression
  | YieldExpression;
type ExpressionWithTypeArguments = TSClassImplements | TSInterfaceHeritage;
type ForInitialiser = Expression | VariableDeclaration;
type ImportClause =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier;
type IterationStatement =
  | DoWhileStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | WhileStatement;
type JSXChild = JSXElement | JSXExpression | JSXFragment | JSXText;
type JSXExpression =
  | JSXEmptyExpression
  | JSXSpreadChild
  | JSXExpressionContainer;
type JSXTagNameExpression = Identifier | MemberExpression | ThisExpression;
type LeftHandSideExpression =
  | CallExpression
  | ClassExpression
  | ClassDeclaration
  | FunctionExpression
  | LiteralExpression
  | MemberExpression
  | PrimaryExpression
  | TaggedTemplateExpression
  | TSNonNullExpression;
type LiteralExpression = BigIntLiteral | Literal | TemplateLiteral;
type Modifier =
  | TSAbstractKeyword
  | TSAsyncKeyword
  | TSConstKeyword
  | TSDeclareKeyword
  | TSDefaultKeyword
  | TSExportKeyword
  | TSPublicKeyword
  | TSPrivateKeyword
  | TSProtectedKeyword
  | TSReadonlyKeyword
  | TSStaticKeyword;
type ObjectLiteralElementLike =
  | MethodDefinition
  | Property
  | RestElement
  | SpreadElement
  | TSAbstractMethodDefinition;
type Parameter = AssignmentPattern | RestElement | TSParameterProperty;
type PrimaryExpression =
  | ArrayExpression
  | ArrayPattern
  | ClassExpression
  | FunctionExpression
  | Identifier
  | Import
  | JSXElement
  | JSXFragment
  | JSXOpeningElement
  | Literal
  | LiteralExpression
  | MetaProperty
  | ObjectExpression
  | ObjectPattern
  | Super
  | TemplateLiteral
  | ThisExpression
  | TSNullKeyword;
type PropertyName = Identifier | Literal;
type Statement =
  | BlockStatement
  | BreakStatement
  | ContinueStatement
  | DebuggerStatement
  | DeclarationStatement
  | EmptyStatement
  | ExpressionStatement
  | IfStatement
  | IterationStatement
  | ImportDeclaration
  | LabeledStatement
  | TSModuleBlock
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | VariableDeclaration
  | WithStatement;
type TypeElement =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature;
type TypeNode =
  | ThisExpression
  | TSAnyKeyword
  | TSArrayType
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSClassImplements
  | TSConditionalType
  | TSConstructorType
  | TSFunctionType
  | TSImportType
  | TSIndexedAccessType
  | TSInferType
  | TSInterfaceHeritage
  | TSIntersectionType
  | TSLiteralType
  | TSMappedType
  | TSNeverKeyword
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSOptionalType
  | TSParenthesizedType
  | TSRestType
  | TSStringKeyword
  | TSSymbolKeyword
  | TSThisType
  | TSTupleType
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypeReference
  | TSTypePredicate
  | TSTypeQuery
  | TSUndefinedKeyword
  | TSUnionType
  | TSUnknownKeyword
  | TSVoidKeyword;
type TSUnaryExpression =
  | AwaitExpression
  | LeftHandSideExpression
  | TSTypeAssertion
  | UnaryExpression
  | UpdateExpression;

///////////////
// Base, common types
//  **Ensure you sort the interfaces alphabetically**
///////////////

interface BinaryExpressionBase extends NodeBase {
  operator: string;
  left: Expression;
  right: Expression;
}

interface ClassDeclarationBase extends NodeBase {
  typeParameters: TSTypeParameterDeclaration;
  superTypeParameters: TSTypeParameterInstantiation;
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
  id: Identifier | null;
  generator: boolean;
  expression: boolean;
  async: boolean;
  params: Parameter[];
  body: BlockStatement | null | undefined;
  returnType?: TSTypeAnnotation;
  typeParameters?: TSTypeParameterDeclaration;
}

interface FunctionSignatureBase extends NodeBase {
  params: Parameter[];
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
//  **Ensure you sort the interfaces alphabetically**
///////////////

export interface ArrayExpression extends NodeBase {
  type: 'ArrayExpression';
  elements: Expression[];
}

export interface ArrayPattern extends NodeBase {
  type: 'ArrayPattern';
  elements: Expression[];
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

export interface ArrowFunctionExpression extends NodeBase {
  type: 'ArrowFunctionExpression';
  generator: boolean;
  id: null;
  params: Parameter[];
  body: Expression | BlockStatement;
  async: boolean;
  expression: boolean;
  returnType: TSTypeAnnotation;
  typeParameters: TSTypeParameterDeclaration;
}

export interface AssignmentExpression extends BinaryExpressionBase {
  type: 'AssignmentExpression';
}

export interface AssignmentPattern extends NodeBase {
  type: 'AssignmentPattern';
  left: BindingName;
  right?: Expression;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

export interface AwaitExpression extends NodeBase {
  type: 'AwaitExpression';
  argument: TSUnaryExpression;
}

export interface BigIntLiteral extends LiteralBase {
  type: 'BigIntLiteral';
}

export interface BinaryExpression extends BinaryExpressionBase {
  type: 'BinaryExpression';
}

export interface BlockStatement extends NodeBase {
  type: 'BlockStatement';
  body: Statement[];
}

export interface BreakStatement extends NodeBase {
  type: 'BreakStatement';
  label: Identifier | null;
}

export interface CallExpression extends NodeBase {
  type: 'CallExpression';
  callee: LeftHandSideExpression;
  arguments: Expression[];
  typeParameters?: TSTypeParameterInstantiation;
}

export interface CatchClause extends NodeBase {
  type: 'CatchClause';
  param: BindingName | null;
  body: BlockStatement;
}

export interface ClassBody extends NodeBase {
  type: 'ClassBody';
  body: ClassElement[];
}

export interface ClassDeclaration extends ClassDeclarationBase {
  type: 'ClassDeclaration';
}

export interface ClassExpression extends ClassDeclarationBase {
  type: 'ClassExpression';
}

export interface ClassProperty extends ClassPropertyBase {
  type: 'ClassProperty';
}

export interface ConditionalExpression extends NodeBase {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface ContinueStatement extends NodeBase {
  type: 'ContinueStatement';
  label: Identifier | null;
}

export interface DebuggerStatement extends NodeBase {
  type: 'DebuggerStatement';
}

export interface Decorator extends NodeBase {
  type: 'Decorator';
  expression: LeftHandSideExpression;
}

export interface DoWhileStatement extends NodeBase {
  type: 'DoWhileStatement';
  test: Expression;
  body: Statement;
}

export interface EmptyStatement extends NodeBase {
  type: 'EmptyStatement';
}

export interface ExportAllDeclaration extends NodeBase {
  type: 'ExportAllDeclaration';
  source: Expression | null;
}

export interface ExportDefaultDeclaration extends NodeBase {
  type: 'ExportDefaultDeclaration';
  declaration: Expression;
}

export interface ExportNamedDeclaration extends NodeBase {
  type: 'ExportNamedDeclaration';
  declaration: Expression | null;
  specifiers: ExportSpecifier[];
  source: Expression | null;
}

export interface ExportSpecifier extends NodeBase {
  type: 'ExportSpecifier';
  local: Identifier;
  exported: Identifier;
}

export interface ExpressionStatement extends NodeBase {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface ForInStatement extends NodeBase {
  type: 'ForInStatement';
  left: ForInitialiser;
  right: Expression;
  body: Statement;
}

export interface ForOfStatement extends NodeBase {
  type: 'ForOfStatement';
  left: ForInitialiser;
  right: Expression;
  body: Statement;
  await: boolean;
}

export interface ForStatement extends NodeBase {
  type: 'ForStatement';
  init: Expression | ForInitialiser | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

export interface FunctionDeclaration extends FunctionDeclarationBase {
  type: 'FunctionDeclaration';
}

export interface FunctionExpression extends FunctionDeclarationBase {
  type: 'FunctionExpression';
}

export interface Identifier extends NodeBase {
  type: 'Identifier';
  name: string;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

export interface IfStatement extends NodeBase {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

export interface Import extends NodeBase {
  type: 'Import';
}

export interface ImportDeclaration extends NodeBase {
  type: 'ImportDeclaration';
  source: Expression;
  specifiers: ImportClause[];
}

export interface ImportDefaultSpecifier extends NodeBase {
  type: 'ImportDefaultSpecifier';
  local: Identifier;
}

export interface ImportNamespaceSpecifier extends NodeBase {
  type: 'ImportNamespaceSpecifier';
  local: Identifier;
}

export interface ImportSpecifier extends NodeBase {
  type: 'ImportSpecifier';
  local: Identifier;
  imported: Identifier;
}

export interface JSXAttribute extends NodeBase {
  type: 'JSXAttribute';
  name: JSXIdentifier;
  value: Literal | JSXExpression | null;
}

export interface JSXClosingElement extends NodeBase {
  type: 'JSXClosingElement';
  name: JSXTagNameExpression;
}

export interface JSXClosingFragment extends NodeBase {
  type: 'JSXClosingFragment';
}

export interface JSXElement extends NodeBase {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  closingElement: JSXClosingElement | null;
  children: JSXChild[];
}

export interface JSXEmptyExpression extends NodeBase {
  type: 'JSXEmptyExpression';
}

export interface JSXExpressionContainer extends NodeBase {
  type: 'JSXExpressionContainer';
  expression: Expression | JSXEmptyExpression;
}

export interface JSXFragment extends NodeBase {
  type: 'JSXFragment';
  openingFragment: JSXOpeningFragment;
  closingFragment: JSXClosingFragment;
  children: JSXChild[];
}

export interface JSXIdentifier extends NodeBase {
  type: 'JSXIdentifier';
  name: string;
}

export interface JSXOpeningElement extends NodeBase {
  type: 'JSXOpeningElement';
  typeParameters: TSTypeParameterInstantiation | undefined;
  selfClosing: boolean;
  name: JSXTagNameExpression;
  attributes: JSXAttribute[];
}

export interface JSXOpeningFragment extends NodeBase {
  type: 'JSXOpeningFragment';
}

export interface JSXSpreadAttribute extends NodeBase {
  type: 'JSXSpreadAttribute';
  argument: Expression;
}

export interface JSXSpreadChild extends NodeBase {
  type: 'JSXSpreadChild';
  expression: Expression | JSXEmptyExpression;
}

export interface JSXText extends NodeBase {
  type: 'JSXText';
  value: string;
  raw: string;
}

export interface LabeledStatement extends NodeBase {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statement;
}

export interface Literal extends LiteralBase {
  type: 'Literal';
}

export interface LogicalExpression extends BinaryExpressionBase {
  type: 'LogicalExpression';
}

export interface MemberExpression extends NodeBase {
  type: 'MemberExpression';
  object: LeftHandSideExpression;
  property: Expression | Identifier;
  computed?: boolean;
}

export interface MetaProperty extends NodeBase {
  type: 'MetaProperty';
  meta: Identifier;
  property: Identifier;
}

export interface MethodDefinition extends MethodDefinitionBase {
  type: 'MethodDefinition';
}

export interface NewExpression extends NodeBase {
  type: 'NewExpression';
  callee: LeftHandSideExpression;
  arguments: Expression[];
  typeParameters?: TSTypeParameterInstantiation;
}

export interface ObjectExpression extends NodeBase {
  type: 'ObjectExpression';
  properties: ObjectLiteralElementLike[];
}

export interface ObjectPattern extends NodeBase {
  type: 'ObjectPattern';
  properties: ObjectLiteralElementLike[];
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

export interface Program extends NodeBase {
  type: 'Program';
  body: Statement[];
  sourceType: 'module' | 'script';
}

export interface Property extends NodeBase {
  type: 'Property';
  key: PropertyName;
  value: Expression | AssignmentPattern | BindingName; // TODO
  computed: boolean;
  method: boolean;
  shorthand: boolean;
  kind: 'init';
}

export interface RestElement extends NodeBase {
  type: 'RestElement';
  argument: BindingName | Expression | PropertyName;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
}

export interface ReturnStatement extends NodeBase {
  type: 'ReturnStatement';
  argument: Expression | null;
}

export interface SequenceExpression extends NodeBase {
  type: 'SequenceExpression';
  expressions: Expression[];
}

export interface SpreadElement extends NodeBase {
  type: 'SpreadElement';
  argument: BindingName | Expression | PropertyName;
}

export interface Super extends NodeBase {
  type: 'Super';
}

export interface SwitchCase extends NodeBase {
  type: 'SwitchCase';
  test: Expression;
  consequent: Statement[];
}

export interface SwitchStatement extends NodeBase {
  type: 'SwitchStatement';
  discriminant: Expression;
  cases: SwitchCase[];
}

export interface TaggedTemplateExpression extends NodeBase {
  type: 'TaggedTemplateExpression';
  typeParameters: TSTypeParameterInstantiation;
  tag: LeftHandSideExpression;
  quasi: TemplateLiteral;
}

export interface TemplateElement extends NodeBase {
  type: 'TemplateElement';
  value: {
    raw: string;
    cooked: string;
  };
  tail: boolean;
}

export interface TemplateLiteral extends NodeBase {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

export interface ThisExpression extends NodeBase {
  type: 'ThisExpression';
}

export interface ThrowStatement extends NodeBase {
  type: 'ThrowStatement';
  argument: Statement | null;
}

export interface TryStatement extends NodeBase {
  type: 'TryStatement';
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement;
}

export interface TSAbstractClassProperty extends ClassPropertyBase {
  type: 'TSAbstractClassProperty';
}

export interface TSAbstractKeyword extends NodeBase {
  type: 'TSAbstractKeyword';
}

export interface TSAbstractMethodDefinition extends MethodDefinitionBase {
  type: 'TSAbstractMethodDefinition';
}

export interface TSAnyKeyword extends NodeBase {
  type: 'TSAnyKeyword';
}

export interface TSArrayType extends NodeBase {
  type: 'TSTSArrayType';
  elementType: TypeNode;
}

export interface TSAsExpression extends NodeBase {
  type: 'TSAsExpression';
  expression: Expression;
  typeAnnotation: TypeNode;
}

export interface TSAsyncKeyword extends NodeBase {
  type: 'TSAsyncKeyword';
}

export interface TSBigIntKeyword extends NodeBase {
  type: 'TSBigIntKeyword';
}

export interface TSBooleanKeyword extends NodeBase {
  type: 'TSBooleanKeyword';
}

export interface TSCallSignatureDeclaration extends FunctionSignatureBase {
  type: 'TSCallSignatureDeclaration';
}

export interface TSClassImplements extends TSHeritageBase {
  type: 'TSClassImplements';
}

export interface TSConditionalType extends NodeBase {
  type: 'TSConditionalType';
  checkType: TypeNode;
  extendsType: TypeNode;
  trueType: TypeNode;
  falseType: TypeNode;
}

export interface TSConstKeyword extends NodeBase {
  type: 'TSConstKeyword';
}

export interface TSConstructorType extends FunctionSignatureBase {
  type: 'TSConstructorType';
}

export interface TSConstructSignatureDeclaration extends FunctionSignatureBase {
  type: 'TSConstructSignatureDeclaration';
}

export interface TSDeclareFunction extends NodeBase {
  type: 'TSDeclareFunction';
  id: Identifier | null;
  generator: boolean;
  expression: boolean;
  async: boolean;
  params: Parameter;
  body: BlockStatement | null | undefined;
  returnType?: TSTypeAnnotation;
  declare: boolean;
  typeParameters?: TSTypeParameterDeclaration;
}

export interface TSDeclareKeyword extends NodeBase {
  type: 'TSDeclareKeyword';
}

export interface TSDefaultKeyword extends NodeBase {
  type: 'TSDefaultKeyword';
}

export interface TSEnumDeclaration extends NodeBase {
  type: 'TSEnumDeclaration';
  id: Identifier;
  members: TSEnumMember[];
  const?: boolean;
  declare?: boolean;
  modifiers?: Modifier[];
  decorators?: Decorator[];
}

export interface TSEnumMember extends NodeBase {
  type: 'TSEnumMember';
  id: PropertyName;
  initializer?: Expression;
}

export interface TSExportAssignment extends NodeBase {
  type: 'TSExportAssignment';
  expression: Expression;
}

export interface TSExportKeyword extends NodeBase {
  type: 'TSExportKeyword';
}

export interface TSExternalModuleReference extends NodeBase {
  type: 'TSExternalModuleReference';
  expression: Expression;
}

export interface TSFunctionType extends FunctionSignatureBase {
  type: 'TSFunctionType';
}

export interface TSImportEqualsDeclaration extends NodeBase {
  type: 'TSImportEqualsDeclaration';
  id: Identifier;
  moduleReference: EntityName | TSExternalModuleReference;
  isExport: boolean;
}

export interface TSImportType extends NodeBase {
  type: 'TSImportType';
  isTypeOf: boolean;
  parameter: TypeNode;
  qualifier: EntityName | null;
  typeParameters: TSTypeParameterInstantiation | null;
}

export interface TSIndexedAccessType extends NodeBase {
  type: 'TSIndexedAccessType';
  objectType: TypeNode;
  indexType: TypeNode;
}

export interface TSIndexSignature extends NodeBase {
  type: 'TSIndexSignature';
  parameters: Parameter;
  typeAnnotation?: TSTypeAnnotation;
  readonly?: boolean;
  accessibility?: Accessibility;
  export?: boolean;
  static?: boolean;
}

export interface TSInferType extends NodeBase {
  type: 'TSInferType';
  typeParameter: TSTypeParameterDeclaration;
}

export interface TSInterfaceDeclaration extends NodeBase {
  type: 'TSInterfaceDeclaration';
  body: TSInterfaceBody;
  id: Identifier;
  typeParameters?: TSTypeParameterDeclaration;
  extends?: ExpressionWithTypeArguments[];
  implements?: ExpressionWithTypeArguments[];
  decorators?: Decorator[];
  abstract?: boolean;
  declare?: boolean;
}

export interface TSInterfaceBody extends NodeBase {
  type: 'TSInterfaceBody';
  body: TypeElement[];
}

export interface TSInterfaceHeritage extends TSHeritageBase {
  type: 'TSInterfaceHeritage';
}

export interface TSIntersectionType extends NodeBase {
  type: 'TSIntersectionType';
  types: TypeNode[];
}

export interface TSLiteralType extends NodeBase {
  type: 'TSLiteralType';
  literal: LiteralExpression | UnaryExpression | UpdateExpression;
}

export interface TSMappedType extends NodeBase {
  type: 'TSMappedType';
  typeParameter: TSTypeParameterDeclaration;
  readonly?: boolean | '-' | '+';
  optional?: boolean | '-' | '+';
  typeAnnotation?: TypeNode;
}

export interface TSMethodSignature extends NodeBase {
  type: 'TSMethodSignature';
  computed: boolean;
  key: PropertyName;
  params: Parameter[];
  optional?: boolean;
  returnType?: TypeNode;
  readonly?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  accessibility?: Accessibility;
  export?: boolean;
  static?: boolean;
}

export interface TSModuleBlock extends NodeBase {
  type: 'TSModuleBlock';
  body: Statement[];
}

export interface TSModuleDeclaration extends NodeBase {
  type: 'TSModuleDeclaration';
  id: Identifier | Literal;
  body?: TSModuleBlock | Identifier;
  global?: boolean;
}

export interface TSNamespaceExportDeclaration extends NodeBase {
  type: 'TSNamespaceExportDeclaration';
  id: Identifier;
}

export interface TSNeverKeyword extends NodeBase {
  type: 'TSNeverKeyword';
}

export interface TSNonNullExpression extends NodeBase {
  type: 'TSNonNullExpression';
  expression: Expression;
}

export interface TSNullKeyword extends NodeBase {
  type: 'TSNullKeyword';
}

export interface TSNumberKeyword extends NodeBase {
  type: 'TSNumberKeyword';
}

export interface TSObjectKeyword extends NodeBase {
  type: 'TSObjectKeyword';
}

export interface TSOptionalType extends NodeBase {
  type: 'TSOptionalType';
  typeAnnotation: TypeNode;
}

export interface TSParameterProperty extends NodeBase {
  type: 'TSParameterProperty';
  accessibility: Accessibility | undefined;
  readonly: boolean | undefined;
  static: boolean | undefined;
  export: boolean | undefined;
  parameter: AssignmentPattern | BindingName | RestElement;
}

export interface TSParenthesizedType extends NodeBase {
  type: 'TSParenthesizedType';
  typeAnnotation: TypeNode;
}

export interface TSPropertySignature extends NodeBase {
  type: 'TSPropertySignature';
  optional: boolean | undefined;
  computed: boolean;
  key: PropertyName;
  typeAnnotation: TSTypeAnnotation | undefined;
  initializer: Expression | undefined;
  readonly: boolean | undefined;
  static: boolean | undefined;
  export: boolean | undefined;
  accessability?: Accessibility;
}

export interface TSPublicKeyword extends NodeBase {
  type: 'TSPublicKeyword';
}

export interface TSPrivateKeyword extends NodeBase {
  type: 'TSPrivateKeyword';
}

export interface TSProtectedKeyword extends NodeBase {
  type: 'TSProtectedKeyword';
}

export interface TSQualifiedName extends NodeBase {
  type: 'TSQualifiedName';
  left: EntityName;
  right: Identifier;
}

export interface TSReadonlyKeyword extends NodeBase {
  type: 'TSReadonlyKeyword';
}

export interface TSRestType extends NodeBase {
  type: 'TSRestType';
  typeAnnotation: TypeNode;
}

export interface TSStaticKeyword extends NodeBase {
  type: 'TSStaticKeyword';
}

export interface TSStringKeyword extends NodeBase {
  type: 'TSStringKeyword';
}

export interface TSSymbolKeyword extends NodeBase {
  type: 'TSSymbolKeyword';
}

export interface TSThisType extends NodeBase {
  type: 'TSThisType';
}

export interface TSTupleType extends NodeBase {
  type: 'TSTupleType';
  elementTypes: TypeNode[];
}

export interface TSTypeAliasDeclaration extends NodeBase {
  type: 'TSTypeAliasDeclaration';
  id: Identifier;
  typeAnnotation: TypeNode;
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
}

export interface TSTypeAnnotation extends NodeBase {
  type: 'TSTypeAnnotation';
  typeAnnotation: TypeNode;
}

export interface TSTypeAssertion extends NodeBase {
  type: 'TSTypeAssertion';
  typeAnnotation: TypeNode;
  expression: UnaryExpression;
}

export interface TSTypeLiteral extends NodeBase {
  type: 'TSTypeLiteral';
  members: TypeElement;
}

export interface TSTypeOperator extends NodeBase {
  type: 'TSTypeOperator';
  operator: 'keyof' | 'unique';
  typeAnnotation?: TSTypeAnnotation;
}

export interface TSTypeParameter extends NodeBase {
  type: 'TSTypeParameter';
  name: Identifier;
  constraint: TypeNode | undefined;
  default: TypeNode | undefined;
}

export interface TSTypeParameterDeclaration extends NodeBase {
  type: 'TSTypeParameterDeclaration';
  params: TSTypeParameter[];
}

export interface TSTypeParameterInstantiation extends NodeBase {
  type: 'TSTypeParameterInstantiation';
  params: TypeNode[];
}

export interface TSTypePredicate extends NodeBase {
  type: 'TSTypePredicate';
  parameterName: Identifier | TSThisType;
  typeAnnotation: TypeNode;
}

export interface TSTypeQuery extends NodeBase {
  type: 'TSTypeQuery';
  exprName: EntityName;
}

export interface TSTypeReference extends NodeBase {
  type: 'TSTypeReference';
  typeName: EntityName;
  typeParameters: TSTypeParameterInstantiation;
}

export interface TSUndefinedKeyword extends NodeBase {
  type: 'TSUndefinedKeyword';
}

export interface TSUnionType extends NodeBase {
  type: 'TSUnionType';
  types: TypeNode[];
}

export interface TSUnknownKeyword extends NodeBase {
  type: 'TSUnknownKeyword';
}

export interface TSVoidKeyword extends NodeBase {
  type: 'TSVoidKeyword';
}

export interface UpdateExpression extends UnaryExpressionBase {
  type: 'UpdateExpression';
}

export interface UnaryExpression extends UnaryExpressionBase {
  type: 'UnaryExpression';
}

export interface VariableDeclaration extends NodeBase {
  type: 'VariableDeclaration';
  declarations: VariableDeclarator[];
  kind: 'let' | 'const' | 'var';
  declare?: boolean;
}

export interface VariableDeclarator extends NodeBase {
  type: 'VariableDeclarator';
  id: BindingName;
  init: Expression | null;
  definite?: boolean;
}

export interface WhileStatement extends NodeBase {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

export interface WithStatement extends NodeBase {
  type: 'WithStatement';
  object: Expression;
  body: Statement;
}

export interface YieldExpression extends NodeBase {
  type: 'YieldExpression';
  delegate: boolean;
  argument?: Expression;
}
