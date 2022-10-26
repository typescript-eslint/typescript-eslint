import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored<%> {}',
      'function ignored<%>() {}',
      'type Ignored<%> = { ignored: % };',
      'interface Ignored<%> extends Ignored<string> {}',
    ],
    options: {
      selector: 'typeParameter',
    },
  },
]);
