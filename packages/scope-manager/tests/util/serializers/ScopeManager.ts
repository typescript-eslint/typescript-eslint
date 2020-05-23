import { createSerializer } from './baseSerializer';
import { ScopeManager } from '../../../src/ScopeManager';

const serializer = createSerializer(ScopeManager, [
  // purposely put variables first
  'variables',
  'scopes',
]);

export { serializer };
