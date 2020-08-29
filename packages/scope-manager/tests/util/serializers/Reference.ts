import { createSerializer } from './baseSerializer';
import { Reference } from '../../../src/referencer/Reference';

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
