import { ESLintScopeVariable } from './ESLintScopeVariable';
import type { Variable } from './Variable';
import type { Scope } from '../scope';

interface ImplicitLibVariableOptions {
  readonly eslintImplicitGlobalSetting?: ESLintScopeVariable['eslintImplicitGlobalSetting'];
  readonly isTypeVariable?: boolean;
  readonly isValueVariable?: boolean;
  readonly writeable?: boolean;
}

/**
 * An variable implicitly defined by the TS Lib
 */
class ImplicitLibVariable extends ESLintScopeVariable implements Variable {
  /**
   * `true` if the variable is valid in a type context, false otherwise
   */
  public readonly isTypeVariable: boolean;

  /**
   * `true` if the variable is valid in a value context, false otherwise
   */
  public readonly isValueVariable: boolean;

  public constructor(
    scope: Scope,
    name: string,
    {
      isTypeVariable,
      isValueVariable,
      writeable,
      eslintImplicitGlobalSetting,
    }: ImplicitLibVariableOptions,
  ) {
    super(name, scope);
    this.isTypeVariable = isTypeVariable ?? false;
    this.isValueVariable = isValueVariable ?? false;
    this.writeable = writeable ?? false;
    this.eslintImplicitGlobalSetting =
      eslintImplicitGlobalSetting ?? 'readonly';
  }
}

export { ImplicitLibVariable, ImplicitLibVariableOptions };
