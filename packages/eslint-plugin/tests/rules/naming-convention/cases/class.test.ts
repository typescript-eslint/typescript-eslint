import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: ['class % {}', 'abstract class % {}', 'const ignored = class % {}'],
    options: {
      selector: 'class',
    },
  },
]);
