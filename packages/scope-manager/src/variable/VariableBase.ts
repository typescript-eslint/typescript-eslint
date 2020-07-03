import { TSESTree } from '@typescript-eslint/types';
import { Definition } from '../definition';
import { createIdGenerator } from '../ID';
import { Reference } from '../referencer/Reference';
import { Scope } from '../scope';

const generator = createIdGenerator();

class VariableBase {
  /**
   * A unique ID for this instance - primarily used to help debugging and testing
   */
  public readonly $id: number = generator();

  /**
   * The array of the definitions of this variable.
   * @public
   */
  public readonly defs: Definition[] = [];
  /**
   * True if the variable is considered used for the purposes of `no-unused-vars`, false otherwise.
   * @public
   */
  public eslintUsed = false;
  /**
   * The array of `Identifier` nodes which define this variable.
   * If this variable is redeclared, this array includes two or more nodes.
   * @public
   */
  public readonly identifiers: TSESTree.Identifier[] = [];
  /**
   * The variable name, as given in the source code.
   * @public
   */
  public readonly name: string;
  /**
   * List of {@link Reference} of this variable (excluding parameter entries)  in its defining scope and all nested scopes.
   * For defining occurrences only see {@link Variable#defs}.
   * @public
   */
  public readonly references: Reference[] = [];
  /**
   * Reference to the enclosing Scope.
   */
  public readonly scope: Scope;

  constructor(name: string, scope: Scope) {
    this.name = name;
    this.scope = scope;
  }
}

export { VariableBase };
