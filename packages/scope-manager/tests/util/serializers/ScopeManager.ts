import { ScopeManager } from '../../../src/ScopeManager';
import { createSerializer } from './baseSerializer';

const serializer = createSerializer(ScopeManager, [
  // purposely put variables first
  'variables',
  'scopes',
]);

export { serializer };
