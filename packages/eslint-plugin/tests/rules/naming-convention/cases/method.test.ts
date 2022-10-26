import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored { private %() {} }',
      'class Ignored { private "%"() {} }',
      'class Ignored { private readonly %() {} }',
      'class Ignored { private static %() {} }',
      'class Ignored { private static readonly %() {} }',
      'class Ignored { private % = () => {} }',
      'class Ignored { abstract %() }',
      'class Ignored { declare %() }',
      'class Ignored { #%() }',
      'class Ignored { static #%() }',
    ],
    options: {
      selector: 'classMethod',
    },
  },
  {
    code: [
      'const ignored = { %() {} };',
      'const ignored = { "%"() {} };',
      'const ignored = { %: () => {} };',
    ],
    options: {
      selector: 'objectLiteralMethod',
    },
  },
  {
    code: [
      'interface Ignored { %(): string }',
      'interface Ignored { "%"(): string }',
      'type Ignored = { %(): string }',
      'type Ignored = { "%"(): string }',
    ],
    options: {
      selector: 'typeMethod',
    },
  },
]);
