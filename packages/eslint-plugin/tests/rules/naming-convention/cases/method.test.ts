import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored { private %() {} }',
      'class Ignored { private "%"() {} }',
      'class Ignored { private async %() {} }',
      'class Ignored { private static %() {} }',
      'class Ignored { private static async %() {} }',
      'class Ignored { private % = () => {} }',
      'class Ignored { abstract %() }',
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
      'interface Ignored { %: () => string }',
      'interface Ignored { "%": () => string }',
      'type Ignored = { %(): string }',
      'type Ignored = { "%"(): string }',
      'type Ignored = { %: () => string }',
      'type Ignored = { "%": () => string }',
    ],
    options: {
      selector: 'typeMethod',
    },
  },
]);
