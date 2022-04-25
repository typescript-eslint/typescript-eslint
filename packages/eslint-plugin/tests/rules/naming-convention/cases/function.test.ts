import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: ['function % () {}', '(function % () {});', 'declare function % ();'],
    options: {
      selector: 'function',
    },
  },
]);
