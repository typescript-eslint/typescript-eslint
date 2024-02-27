import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored { accessor % = 10; }',
      'class Ignored { accessor #% = 10; }',
      'class Ignored { static accessor % = 10; }',
      'class Ignored { static accessor #% = 10; }',
      'class Ignored { private accessor % = 10; }',
      'class Ignored { private static accessor % = 10; }',
      'class Ignored { override accessor % = 10; }',
      'class Ignored { accessor "%" = 10; }',
      'class Ignored { protected accessor % = 10; }',
      'class Ignored { public accessor % = 10; }',
      'class Ignored { abstract accessor %; }',
    ],
    options: {
      selector: 'autoAccessor',
    },
  },
]);
