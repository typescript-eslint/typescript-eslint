import type { Variable } from '../../src';
import { ImplicitLibVariable } from '../../src';

function getRealVariables(variables: Variable[]): Variable[] {
  return variables.filter(v => !(v instanceof ImplicitLibVariable));
}

export { getRealVariables };
