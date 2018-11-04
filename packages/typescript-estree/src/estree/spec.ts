/**
 * This document specifies the core ESTree AST node types based on:
 * - ES5: https://github.com/estree/estree/blob/master/es5.md
 * - ES2015: https://github.com/estree/estree/blob/master/es2015.md
 * - ES2016: https://github.com/estree/estree/blob/master/es2016.md
 * - ES2017: https://github.com/estree/estree/blob/master/es2017.md
 * - ES2018: https://github.com/estree/estree/blob/master/es2018.md
 */

/**
 * Node objects
 *
 * ESTree AST nodes are represented as `Node` objects, which may have any prototype inheritance but which implement the following interface:
 */

export interface Node {
  type: string;
  loc: SourceLocation | null;
}

/**
 * The `type` field is a string representing the AST variant type. Each subtype of `Node` is documented below with the specific string of its `type` field. You can use this field to determine which interface a node implements.
 *
 * The `loc` field represents the source location information of the node. If the node contains no information about the source location, the field is `null`; otherwise it is an object consisting of a start position (the position of the first character of the parsed source region) and an end position (the position of the first character after the parsed source region):
 */
export interface SourceLocation {
  source: string | null;
  start: Position;
  end: Position;
}

/**
 * Each `Position` object consists of a `line` number (1-indexed) and a `column` number (0-indexed):
 */
export interface Position {
  line: number; // >= 1
  column: number; // >= 0
}

/**
 * Identifier
 *
 * An identifier. Note that an identifier may be an expression or a destructuring pattern.
 */
export interface Identifier extends Expression, Pattern {
  type: 'Identifier';
  name: string;
}

/**
 * Literal
 *
 * A literal token. Note that a literal can be an expression.
 */
export interface Literal extends Expression {
  type: 'Literal';
  value: string | boolean | null | number | RegExp;
}

/**
 * RegExpLiteral
 *
 * The `regex` property allows regexes to be represented in environments that don’t
 * support certain flags such as `y` or `u`. In environments that don't support
 * these flags `value` will be `null` as the regex can't be represented natively.
 */
export interface RegExpLiteral extends Literal {
  regex: {
    pattern: string;
    flags: string;
  };
}

/**
 * Programs
 *
 * A complete program source tree.
 *
 * ES2015+ Parsers must specify sourceType as "module" if the source has been parsed as an ES6 module. Otherwise, sourceType must be "script".
 */
export interface Program extends Node {
  type: 'Program';
  body: Array<Directive | Statement | ModuleDeclaration>;
  sourceType: 'script' | 'module';
}

/**
 * Functions
 *
 * A function declaration or expression.
 */
export interface Function extends Node {
  id: Identifier | null;
  params: Pattern[];
  body: FunctionBody;
  generator: boolean;
  async: boolean;
}

/**
 * Statements
 *
 * Any statement.
 */
export interface Statement extends Node {}

/**
 * ExpressionStatement
 *
 * An expression statement, i.e., a statement consisting of a single expression.
 */
export interface ExpressionStatement extends Statement {
  type: 'ExpressionStatement';
  expression: Expression;
}

/**
 * Directive
 *
 * A directive from the directive prologue of a script or function.
 * The `directive` property is the raw string source of the directive without quotes.
 */
export interface Directive extends Node {
  type: 'ExpressionStatement';
  expression: Literal;
  directive: string;
}

/**
 * BlockStatement
 *
 * A block statement, i.e., a sequence of statements surrounded by braces.
 */
export interface BlockStatement extends Statement {
  type: 'BlockStatement';
  body: Statement[];
}

/**
 * FunctionBody
 *
 * The body of a function, which is a block statement that may begin with directives.
 */
export interface FunctionBody extends BlockStatement {
  body: Array<Directive | Statement>;
}

/**
 * EmptyStatement
 *
 * An empty statement, i.e., a solitary semicolon.
 */
export interface EmptyStatement extends Statement {
  type: 'EmptyStatement';
}

/**
 * DebuggerStatement
 *
 * A `debugger` statement.
 */
export interface DebuggerStatement extends Statement {
  type: 'DebuggerStatement';
}

/**
 * WithStatement
 *
 * A `with` statement.
 */
export interface WithStatement extends Statement {
  type: 'WithStatement';
  object: Expression;
  body: Statement;
}

/**
 * Control flow
 */

/**
 * ReturnStatement
 *
 * A `return` statement.
 */
export interface ReturnStatement extends Statement {
  type: 'ReturnStatement';
  argument: Expression | null;
}

/**
 * LabeledStatement
 *
 * A labeled statement, i.e., a statement prefixed by a `break`/`continue` label.
 */
export interface LabeledStatement extends Statement {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statement;
}

/**
 * BreakStatement
 *
 * A `break` statement.
 */
export interface BreakStatement extends Statement {
  type: 'BreakStatement';
  label: Identifier | null;
}

/**
 * ContinueStatement
 *
 * A `continue` statement.
 */
export interface ContinueStatement extends Statement {
  type: 'ContinueStatement';
  label: Identifier | null;
}

/**
 * Choice
 */

/**
 * IfStatement
 *
 * An `if` statement.
 */
export interface IfStatement extends Statement {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

/**
 * SwitchStatement
 *
 * A `switch` statement.
 */
export interface SwitchStatement extends Statement {
  type: 'SwitchStatement';
  discriminant: Expression;
  cases: SwitchCase[];
}

/**
 * SwitchCase
 *
 * A `case` (if `test` is an `Expression`) or `default` (if `test === null`) clause in the body of a `switch` statement.
 */
export interface SwitchCase extends Node {
  type: 'SwitchCase';
  test: Expression | null;
  consequent: Statement[];
}

/**
 * Exceptions
 */

/**
 * ThrowStatement
 *
 * A `throw` statement.
 */
export interface ThrowStatement extends Statement {
  type: 'ThrowStatement';
  argument: Expression;
}

/**
 * TryStatement
 *
 * A `try` statement. If `handler` is `null` then `finalizer` must be a `BlockStatement`.
 */
export interface TryStatement extends Statement {
  type: 'TryStatement';
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}

/**
 * CatchClause
 *
 * A `catch` clause following a `try` block.
 *
 * The param is null if the catch binding is omitted. E.g., try { foo() } catch { bar() }
 */
export interface CatchClause extends Node {
  type: 'CatchClause';
  param: Pattern | null;
  body: BlockStatement;
}

/**
 * Loops
 */

/**
 * WhileStatement
 *
 * A `while` statement.
 */
export interface WhileStatement extends Statement {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

/**
 * DoWhileStatement
 *
 * A `do`/`while` statement.
 */
export interface DoWhileStatement extends Statement {
  type: 'DoWhileStatement';
  body: Statement;
  test: Expression;
}

/**
 * ForStatement
 *
 * A `for` statement.
 */
export interface ForStatement extends Statement {
  type: 'ForStatement';
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

/**
 * ForInStatement
 *
 * A `for`/`in` statement.
 */
export interface ForInStatement extends Statement {
  type: 'ForInStatement';
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
}

/**
 * ForOfStatement
 *
 * A `for`/`of` statement and for-await-of statements, e.g., for await (const x of xs) {
 */
export interface ForOfStatement {
  type: 'ForOfStatement';
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
  await: boolean;
}

/**
 * Declarations
 *
 * Any declaration node. Note that declarations are considered statements; this is because declarations can appear in any statement context.
 */
export interface Declaration extends Statement {}

/**
 * FunctionDeclaration
 *
 * A function declaration. Note that unlike in the parent interface `Function`, the `id` cannot be `null`.
 */
export interface FunctionDeclaration extends Function, Declaration {
  type: 'FunctionDeclaration';
  id: Identifier;
}

/**
 * VariableDeclaration
 *
 * A variable declaration.
 */
export interface VariableDeclaration extends Declaration {
  type: 'VariableDeclaration';
  declarations: VariableDeclarator[];
  kind: 'var' | 'let' | 'const';
}

/**
 * VariableDeclarator
 *
 * A variable declarator.
 */
export interface VariableDeclarator extends Node {
  type: 'VariableDeclarator';
  id: Pattern;
  init: Expression | null;
}

/**
 * Expressions
 *
 * Any expression node. Since the left-hand side of an assignment may be any expression in general, an expression can also be a pattern.
 */
export interface Expression extends Node {}

/**
 * Super
 *
 * A super pseudo-expression.
 */
export interface Super extends Node {
  type: 'Super';
}

/**
 * ThisExpression
 *
 * A `this` expression.
 */
export interface ThisExpression extends Expression {
  type: 'ThisExpression';
}

/**
 * SpreadElement
 *
 * Spread expression, e.g., [head, ...iter, tail], f(head, ...iter, ...tail).
 */
export interface SpreadElement extends Node {
  type: 'SpreadElement';
  argument: Expression;
}

/**
 * ArrayExpression
 *
 * An array expression.
 */
export interface ArrayExpression extends Expression {
  type: 'ArrayExpression';
  elements: Array<Expression | SpreadElement | null>;
}

/**
 * ObjectExpression
 *
 * An object expression.
 *
 * Spread properties, e.g., {a: 1, ...obj, b: 2}.
 */
export interface ObjectExpression extends Expression {
  type: 'ObjectExpression';
  properties: Array<Property | SpreadElement>;
}

/**
 * Property
 *
 * A literal property in an object expression can have either a string or number as its `value`. Ordinary property initializers have a `kind` value `"init"`; getters and setters have the kind values `"get"` and `"set"`, respectively.
 */
export interface Property extends Node {
  type: 'Property';
  key: Literal | Identifier | Expression;
  value: Expression;
  kind: 'init' | 'get' | 'set';
  method: boolean;
  shorthand: boolean;
  computed: boolean;
}

/**
 * FunctionExpression
 *
 * A `function` expression.
 */
export interface FunctionExpression extends Function, Expression {
  type: 'FunctionExpression';
}

/**
 * ArrowFunctionExpression
 *
 * A fat arrow function expression, e.g., let foo = (bar) => { / body / }.
 */
export interface ArrowFunctionExpression extends Expression {
  id: Identifier | null;
  params: Pattern[];
  type: 'ArrowFunctionExpression';
  body: FunctionBody | Expression;
  generator: boolean;
  expression: boolean;
}

/**
 * Unary operations
 */

/**
 * UnaryExpression
 *
 * A unary operator expression.
 */
export interface UnaryExpression extends Expression {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression;
}

/**
 * UnaryOperator
 *
 * A unary operator token.
 */
export type UnaryOperator =
  | '-'
  | '+'
  | '!'
  | '~'
  | 'typeof'
  | 'void'
  | 'delete';

/**
 * UpdateExpression
 *
 * An update (increment or decrement) operator expression.
 */
export interface UpdateExpression extends Expression {
  type: 'UpdateExpression';
  operator: UpdateOperator;
  argument: Expression;
  prefix: boolean;
}

/**
 * UpdateOperator
 *
 * An update (increment or decrement) operator token.
 */
export type UpdateOperator = '++' | '--';

/**
 * Binary operations
 */

/**
 * BinaryExpression
 *
 * A binary operator expression.
 */
export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

/**
 * BinaryOperator
 *
 * A binary operator token.
 */
export type BinaryOperator =
  | '=='
  | '!='
  | '==='
  | '!=='
  | '<'
  | '<='
  | '>'
  | '>='
  | '<<'
  | '>>'
  | '>>>'
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '|'
  | '^'
  | '&'
  | 'in'
  | 'instanceof'
  | '**';

/**
 * AssignmentExpression
 *
 * An assignment operator expression.
 *
 * FROM ESTREE DOCS:
 *
 * ```
 * FIXME: This describes the Esprima and Acorn behaviors, which is not currently aligned with the SpiderMonkey behavior.
 *
 * extend interface AssignmentExpression {
 *   left: Pattern;
 * }
 *
 * Note that pre-ES6 code was allowed to pass references around and so left was much more liberal; an implementation might choose to continue using old definition if it needs to support such legacy code.
 * ```
 */
export interface AssignmentExpression extends Expression {
  type: 'AssignmentExpression';
  operator: AssignmentOperator;
  left: Pattern | Expression;
  right: Expression;
}

/**
 * AssignmentOperator
 *
 * An assignment operator token.
 */
export type AssignmentOperator =
  | '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '%='
  | '<<='
  | '>>='
  | '>>>='
  | '|='
  | '^='
  | '&='
  | '**=';

/**
 * LogicalExpression
 *
 * A logical operator expression.
 */
export interface LogicalExpression extends Expression {
  type: 'LogicalExpression';
  operator: LogicalOperator;
  left: Expression;
  right: Expression;
}

/**
 * LogicalOperator
 *
 * A logical operator token.
 */
export type LogicalOperator = '||' | '&&';

/**
 * MemberExpression
 *
 * A member expression. If `computed` is `true`, the node corresponds to a computed (`a[b]`) member expression and `property` is an `Expression`. If `computed` is `false`, the node corresponds to a static (`a.b`) member expression and `property` is an `Identifier`.
 */
export interface MemberExpression extends Expression, Pattern {
  type: 'MemberExpression';
  object: Expression | Super;
  property: Expression;
  computed: boolean;
}

/**
 * ConditionalExpression
 *
 * A conditional expression, i.e., a ternary `?`/`:` expression.
 */
export interface ConditionalExpression extends Expression {
  type: 'ConditionalExpression';
  test: Expression;
  alternate: Expression;
  consequent: Expression;
}

/**
 * CallExpression
 *
 * A function or method call expression.
 */
export interface CallExpression extends Expression {
  type: 'CallExpression';
  callee: Expression | Super;
  arguments: Array<Expression | SpreadElement>;
}

/**
 * NewExpression
 *
 * A `new` expression.
 */
export interface NewExpression extends Expression {
  type: 'NewExpression';
  callee: Expression;
  arguments: Array<Expression | SpreadElement>;
}

/**
 * SequenceExpression
 *
 * A sequence expression, i.e., a comma-separated sequence of expressions.
 */
export interface SequenceExpression extends Expression {
  type: 'SequenceExpression';
  expressions: Expression[];
}

/**
 * YieldExpression
 *
 * A yield expression.
 */
export interface YieldExpression extends Expression {
  type: 'YieldExpression';
  argument: Expression | null;
  delegate: boolean;
}

/**
 * AwaitExpression
 */
export interface AwaitExpression extends Expression {
  type: 'AwaitExpression';
  argument: Expression;
}

/**
 * Template Literals
 */

/**
 * TemplateLiteral
 */
export interface TemplateLiteral extends Expression {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

/**
 * TaggedTemplateExpression
 */
export interface TaggedTemplateExpression extends Expression {
  type: 'TaggedTemplateExpression';
  tag: Expression;
  quasi: TemplateLiteral;
}

/**
 * TemplateElement
 *
 * If the template literal is tagged and the text has an invalid escape, cooked will be null, e.g., tag`\unicode and \u{55}`
 */
export interface TemplateElement extends Node {
  type: 'TemplateElement';
  tail: boolean;
  value: {
    cooked: string | null;
    raw: string;
  };
}

/**
 * Patterns
 *
 * Destructuring binding and assignment are not part of ES5, but all binding positions accept Pattern to allow for destructuring in ES6. Nevertheless, for ES5, the only Pattern subtype is Identifier.
 */
export interface Pattern extends Node {}

/**
 * AssignmentProperty
 */
export interface AssignmentProperty extends Property {
  type: 'Property'; // inherited
  value: Pattern;
  kind: 'init';
  method: false;
}

/**
 * ObjectPattern
 *
 * Rest properties, e.g., {a, ...rest} = obj.
 */
export interface ObjectPattern extends Pattern {
  type: 'ObjectPattern';
  properties: Array<AssignmentProperty | RestElement>;
}

/**
 * ArrayPattern
 */
export interface ArrayPattern extends Pattern {
  type: 'ArrayPattern';
  elements: Array<Pattern | null>;
}

/**
 * RestElement
 */
export interface RestElement extends Pattern {
  type: 'RestElement';
  argument: Pattern;
}

/**
 * AssignmentPattern
 */
export interface AssignmentPattern extends Pattern {
  type: 'AssignmentPattern';
  left: Pattern;
  right: Expression;
}

/**
 * Classes
 */

/**
 * Class
 */
export interface Class extends Node {
  id: Identifier | null;
  superClass: Expression | null;
  body: ClassBody;
}

/**
 * ClassBody
 */
export interface ClassBody extends Node {
  type: 'ClassBody';
  body: MethodDefinition[];
}

/**
 * MethodDefinition
 */
export interface MethodDefinition extends Node {
  type: 'MethodDefinition';
  key: Expression;
  value: FunctionExpression;
  kind: 'constructor' | 'method' | 'get' | 'set';
  computed: boolean;
  static: boolean;
}

/**
 * ClassDeclaration
 */
export interface ClassDeclaration extends Class, Declaration {
  type: 'ClassDeclaration';
  id: Identifier;
}

/**
 * ClassExpression
 */
export interface ClassExpression extends Class, Expression {
  type: 'ClassExpression';
}

/**
 * MetaProperty
 */
export interface MetaProperty extends Expression {
  type: 'MetaProperty';
  meta: Identifier;
  property: Identifier;
}

/**
 * Modules
 */

/**
 * ModuleDeclaration
 *
 * A module `import` or `export` declaration.
 */
export interface ModuleDeclaration extends Node {}

/**
 * ModuleSpecifier
 *
 * A specifier in an import or export declaration.
 */
export interface ModuleSpecifier extends Node {
  local: Identifier;
}

/**
 * Imports
 */

/**
 * ImportDeclaration
 *
 * An import declaration, e.g., `import foo from "mod";`.
 */
export interface ImportDeclaration extends ModuleDeclaration {
  type: 'ImportDeclaration';
  specifiers: Array<
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
  >;
  source: Literal;
}

/**
 * ImportSpecifier
 *
 * An imported variable binding, e.g., `{foo}` in `import {foo} from "mod"` or `{foo as bar}` in `import {foo as bar} from "mod"`. The `imported` field refers to the name of the export imported from the module. The `local` field refers to the binding imported into the local module scope. If it is a basic named import, such as in `import {foo} from "mod"`, both `imported` and `local` are equivalent `Identifier` nodes; in this case an `Identifier` node representing `foo`. If it is an aliased import, such as in `import {foo as bar} from "mod"`, the `imported` field is an `Identifier` node representing `foo`, and the `local` field is an `Identifier` node representing `bar`.
 */
export interface ImportSpecifier extends ModuleSpecifier {
  type: 'ImportSpecifier';
  imported: Identifier;
}

/**
 * ImportDefaultSpecifier
 *
 * A default import specifier, e.g., `foo` in `import foo from "mod.js"`.
 */
export interface ImportDefaultSpecifier extends ModuleSpecifier {
  type: 'ImportDefaultSpecifier';
}

/**
 * ImportNamespaceSpecifier
 *
 * A namespace import specifier, e.g., `* as foo` in `import * as foo from "mod.js"`.
 */
export interface ImportNamespaceSpecifier extends ModuleSpecifier {
  type: 'ImportNamespaceSpecifier';
}

/**
 * Exports
 */

/**
 * ExportNamedDeclaration
 *
 * An export named declaration, e.g., `export {foo, bar};`, `export {foo} from "mod";` or `export var foo = 1;`.
 *
 * _Note: Having `declaration` populated with non-empty `specifiers` or non-null `source` results in an invalid state._
 */
export interface ExportNamedDeclaration extends ModuleDeclaration {
  type: 'ExportNamedDeclaration';
  declaration: Declaration | null;
  specifiers: [ExportSpecifier];
  source: Literal | null;
}

/**
 * ExportSpecifier
 *
 * An exported variable binding, e.g., `{foo}` in `export {foo}` or `{bar as foo}` in `export {bar as foo}`. The `exported` field refers to the name exported in the module. The `local` field refers to the binding into the local module scope. If it is a basic named export, such as in `export {foo}`, both `exported` and `local` are equivalent `Identifier` nodes; in this case an `Identifier` node representing `foo`. If it is an aliased export, such as in `export {bar as foo}`, the `exported` field is an `Identifier` node representing `foo`, and the `local` field is an `Identifier` node representing `bar`.
 */
export interface ExportSpecifier extends ModuleSpecifier {
  type: 'ExportSpecifier';
  exported: Identifier;
}

/**
 * ExportDefaultDeclaration
 *
 * An export default declaration, e.g., `export default function () {};` or `export default 1;`.
 */
export interface ExportDefaultDeclaration extends ModuleDeclaration {
  type: 'ExportDefaultDeclaration';
  declaration: Declaration | Expression;
}

/**
 * ExportAllDeclaration
 *
 * An export batch declaration, e.g., `export * from "mod";`.
 */
export interface ExportAllDeclaration extends ModuleDeclaration {
  type: 'ExportAllDeclaration';
  source: Literal;
}
