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
      'abstract class Ignored { abstract get %(): number }',
      'abstract class Ignored { abstract set %(ignored: number) }',
    ],
    options: {
      selector: 'accessor',
    },
  },
]);
