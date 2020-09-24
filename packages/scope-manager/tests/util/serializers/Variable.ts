import { createSerializer } from './baseSerializer';
import { ImplicitLibVariable, Variable } from '../../../src/variable';

const serializer = createSerializer(Variable, [
  //
  'defs',
  'name',
  'references',
  'isValueVariable',
  'isTypeVariable',
]);
const implicitLibVarSerializer = createSerializer(ImplicitLibVariable, [
  //
  'defs',
  'name',
  'references',
  'isValueVariable',
  'isTypeVariable',
]);

export { serializer, implicitLibVarSerializer };
