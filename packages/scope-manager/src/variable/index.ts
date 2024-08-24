import type { ESLintScopeVariable } from './ESLintScopeVariable';
import type { Variable } from './Variable';

export { ESLintScopeVariable } from './ESLintScopeVariable';
export { ImplicitLibVariable } from './ImplicitLibVariable';
export type { ImplicitLibVariableOptions } from './ImplicitLibVariable';
export { Variable } from './Variable';

export type ScopeVariable = Variable | ESLintScopeVariable;
