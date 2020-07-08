import { createSerializer } from './baseSerializer';
import { DefinitionBase } from '../../../src/definition/DefinitionBase';

// hacking around the fact that you can't use abstract classes generically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class DefinitionInstance extends DefinitionBase<any, any, any> {
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
