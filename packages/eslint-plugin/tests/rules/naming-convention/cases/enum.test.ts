import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: ['enum % {}'],
    options: {
      selector: 'enum',
    },
  },
]);
