import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from '../../../src/definition/DefinitionBase';
import { createSerializer } from './baseSerializer';

// hacking around the fact that you can't use abstract classes generically
class DefinitionInstance extends DefinitionBase<
  /* eslint-disable @typescript-eslint/no-explicit-any */
  any,
  any,
  any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  TSESTree.BindingName
> {
  isTypeDefinition = false;
  isVariableDefinition = false;
}
const serializer = createSerializer(
  DefinitionBase,
  [
    //
    'name',
    'node',
  ],
  DefinitionInstance,
);

export { serializer };
