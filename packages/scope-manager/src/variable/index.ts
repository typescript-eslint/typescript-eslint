import type { ESLintScopeVariable } from './ESLintScopeVariable';
import type { Variable } from './Variable';

export { ESLintScopeVariable } from './ESLintScopeVariable';
export {
  ImplicitLibVariable,
  ImplicitLibVariableOptions,
} from './ImplicitLibVariable';
export { Variable } from './Variable';

export type ScopeVariable = Variable | ESLintScopeVariable;
