import { VariableBase } from './VariableBase';

/**
 * A Variable represents a locally scoped identifier. These include arguments to functions.
 */
class Variable extends VariableBase {
  /**
   * `true` if the variable is valid in a type context, false otherwise
   * @public
   */
  public get isTypeVariable(): boolean {
    if (this.defs.length === 0) {
      // we don't statically know whether this is a type or a value
      return true;
    }

    return this.defs.some(def => def.isTypeDefinition);
  }

  /**
   * `true` if the variable is valid in a value context, false otherwise
   * @public
   */
  public get isValueVariable(): boolean {
    if (this.defs.length === 0) {
      // we don't statically know whether this is a type or a value
      return true;
    }

    return this.defs.some(def => def.isVariableDefinition);
  }
}

export { Variable };
