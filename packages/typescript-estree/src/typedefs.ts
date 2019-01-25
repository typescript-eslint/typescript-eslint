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

interface NodeWithTypeAnnotation extends NodeBase {
  typeAnnotation: TSTypeAnnotation;
}

// NOTE - got to VariableStatement - line 681

// ensure you sort the union members alphabetically...
type ESTreeNode = null;

type BindingPattern = ArrayPattern | ObjectPattern;
type BindingName = Identifier | BindingPattern;
type Expression = null; // TODO - get lists from ts source and convert to estree nodes
type ForInitialiser = Expression | VariableDeclaration;
type Parameter = AssignmentPattern | RestElement | TSParameterProperty;
type Statement = null; // TODO - get lists from ts source and convert to estree nodes

// ensure you sort the following interfaces alphabetically

interface BlockStatement extends NodeBase {
  type: 'BlockStatement';
  body: Statement[];
}

interface BreakStatement extends NodeBase {
  type: 'BreakStatement';
  label: Identifier | null;
}

interface CatchClause extends NodeBase {
  type: 'CatchClause';
  param: BindingName | null;
  body: BlockStatement;
}

interface ContinueStatement extends NodeBase {
  type: 'ContinueStatement';
  label: Identifier | null;
}

interface DoWhileStatement extends NodeBase {
  type: 'DoWhileStatement';
  test: Expression;
  body: Statement;
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

interface FunctionDeclaration extends NodeBase {
  type: 'FunctionDeclaration';
  id: Identifier | null;
  generator: boolean;
  expression: false;
  async: boolean;
  params: Parameter;
  body: BlockStatement | null | undefined;
  returnType?: TSTypeAnnotation;
  typeParameters?: TSTypeParameterDeclaration;
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

interface Identifier extends NodeWithTypeAnnotation {
  type: 'Identifier';
  name: string;
}

interface IfStatement extends NodeBase {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

interface LabeledStatement extends NodeBase {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statement;
}

interface Program extends NodeBase {
  type: 'Program';
  body: Statement[];
  sourceType: 'module' | 'script';
}

interface ReturnStatement extends NodeBase {
  type: 'ReturnStatement';
  argument: Expression | null;
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
