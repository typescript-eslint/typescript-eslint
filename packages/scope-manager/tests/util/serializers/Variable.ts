import { createSerializer } from './baseSerializer';
import { Variable } from '../../../src/variable';

const serializer = createSerializer(Variable, [
  //
  'defs',
  'name',
  'references',
  'isValueVariable',
  'isTypeVariable',
]);

export { serializer };
