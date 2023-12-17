import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'const ignored = { get %() {} };',
      'const ignored = { set "%"(ignored) {} };',
      'class Ignored { private get %() {} }',
      'class Ignored { private set "%"(ignored) {} }',
      'class Ignored { private static get %() {} }',
      'class Ignored { static get #%() {} }',
      'class Ignored { accessor % = 10; }',
      'class Ignored { accessor #% = 10; }',
      'class Ignored { static accessor % = 10; }',
      'class Ignored { static accessor #% = 10; }',
    ],
    options: {
      selector: 'accessor',
    },
  },
]);
