import type { Variable } from '../../src';

import { ImplicitLibVariable } from '../../src';

export function getRealVariables(variables: Variable[]): Variable[] {
  return variables.filter(v => !(v instanceof ImplicitLibVariable));
}
