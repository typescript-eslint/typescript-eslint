import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: ['type % = {};', 'type % = 1;'],
    options: {
      selector: 'typeAlias',
    },
  },
]);
