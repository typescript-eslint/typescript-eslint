import { createSerializer } from './baseSerializer';
import { Reference } from '../../../src/referencer/Reference';

const serializer = createSerializer(Reference, [
  'identifier',
  'init',
  'isTypeReference',
  'isValueReference',
  'resolved',
  'writeExpr',
]);

export { serializer };
