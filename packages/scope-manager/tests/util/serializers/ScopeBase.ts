import { createSerializer } from './baseSerializer';
import { ScopeBase } from '../../../src/scope/ScopeBase';

// hacking around the fact that you can't use abstract classes generically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ScopeInstance extends ScopeBase<any, any, any> {}
const serializer = createSerializer(
  ScopeBase,
  [
    //
    'block',
    'isStrict',
    'references',
    'set',
    'type',
    'upper',
    'variables',
  ],
  ScopeInstance,
);

export { serializer };
