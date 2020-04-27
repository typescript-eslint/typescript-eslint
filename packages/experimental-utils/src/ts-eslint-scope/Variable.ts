import ESLintVariable from 'eslint-scope/lib/variable';
import { TSESTree } from '../ts-estree';
import { Reference } from './Reference';
import { Definition } from './Definition';
import { Scope } from './Scope';

interface Variable {
  /**
   * List of defining occurrences of this variable (like in 'var ...'
   * statements or as parameter), as custom objects.
   */
  defs: Definition[];
  /**
   * True if the variable is considered used for the purposes of `no-unused-vars`, false otherwise.
   */
  eslintUsed?: boolean;
  /**
   * List of defining occurrences of this variable (like in 'var ...'
   * statements or as parameter), as AST nodes.
   */
  identifiers: TSESTree.Identifier[];
  /**
   * The variable name, as given in the source code.
   */
  name: string;
  /**
   * List of {@link Reference|references} of this variable (excluding parameter entries)
   * in its defining scope and all nested scopes. For defining occurrences only see {@link Variable#defs}.
   */
  references: Reference[];
  /**
   * Reference to the enclosing Scope.
   */
  scope?: Scope;
  /**
   * Whether this is a stack variable.
   */
  stack: boolean;
  tainted: boolean;
}
interface VariableStatic {
  // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
  readonly CatchClause: 'CatchClause';
  readonly Parameter: 'Parameter';
  readonly FunctionName: 'FunctionName';
  readonly ClassName: 'ClassName';
  readonly Variable: 'Variable';
  readonly ImportBinding: 'ImportBinding';
  readonly ImplicitGlobalVariable: 'ImplicitGlobalVariable';
}
interface VariableConstructor {
  new (name: string, scope: Scope): Variable;
}

type VariableType =
  // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
  | 'CatchClause'
  | 'Parameter'
  | 'FunctionName'
  | 'ClassName'
  | 'Variable'
  | 'ImportBinding'
  | 'ImplicitGlobalVariable';

const Variable = ESLintVariable as VariableConstructor & VariableStatic;

export { Variable, VariableType };
