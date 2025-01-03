import { ImplicitLibVariable, Variable } from '../../../src/variable';
import { createSerializer } from './baseSerializer';

export const serializer = createSerializer(Variable, [
  //
  'defs',
  'name',
  'references',
  'isValueVariable',
  'isTypeVariable',
]);
export const implicitLibVarSerializer = createSerializer(ImplicitLibVariable, [
  //
  'defs',
  'name',
  'references',
  'isValueVariable',
  'isTypeVariable',
]);
