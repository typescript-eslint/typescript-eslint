import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: ['enum Ignored { % }', 'enum Ignored { "%" }'],
    options: {
      selector: 'enumMember',
    },
  },
]);
