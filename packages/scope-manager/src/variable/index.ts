import type { ESLintScopeVariable } from './ESLintScopeVariable';
import type { Variable } from './Variable';

export { ESLintScopeVariable } from './ESLintScopeVariable';
export {
  ImplicitLibVariable,
  type ImplicitLibVariableOptions,
  type LibDefinition,
  type LibVariableOptions,
} from './ImplicitLibVariable';
export { Variable } from './Variable';

export type ScopeVariable = ESLintScopeVariable | Variable;
