import { ImplicitLibVariable, Variable } from '../../src';

function getRealVariables(variables: Variable[]): Variable[] {
  return variables.filter(v => !(v instanceof ImplicitLibVariable));
}

export { getRealVariables };
