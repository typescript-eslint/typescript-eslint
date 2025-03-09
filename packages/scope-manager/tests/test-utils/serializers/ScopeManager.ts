import { ScopeManager } from '../../../src/ScopeManager';
import { createSerializer } from './baseSerializer';

export const serializer = createSerializer(ScopeManager, [
  // purposely put variables first
  'variables',
  'scopes',
]);
