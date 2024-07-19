import { Reference } from '../../../src/referencer/Reference';
import { createSerializer } from './baseSerializer';

const serializer = createSerializer(Reference, [
  'identifier',
  'init',
  'isRead',
  'isTypeReference',
  'isValueReference',
  'isWrite',
  'resolved',
  'writeExpr',
]);

export { serializer };
