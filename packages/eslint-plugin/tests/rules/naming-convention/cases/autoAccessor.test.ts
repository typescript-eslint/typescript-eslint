import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored { accessor % = 10; }',
      'class Ignored { accessor #% = 10; }',
      'class Ignored { static accessor % = 10; }',
      'class Ignored { static accessor #% = 10; }',
    ],
    options: {
      selector: 'autoAccessor',
    },
  },
]);
