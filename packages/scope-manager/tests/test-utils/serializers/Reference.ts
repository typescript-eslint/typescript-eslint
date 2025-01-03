import { Reference } from '../../../src/referencer/Reference';
import { createSerializer } from './baseSerializer';

export const serializer = createSerializer(Reference, [
  'identifier',
  'init',
  'isRead',
  'isTypeReference',
  'isValueReference',
  'isWrite',
  'resolved',
  'writeExpr',
]);
