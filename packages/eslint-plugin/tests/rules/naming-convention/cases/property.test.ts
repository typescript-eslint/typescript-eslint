import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored { private % }',
      'class Ignored { private "%" = 1 }',
      'class Ignored { private readonly % = 1 }',
      'class Ignored { private static % }',
      'class Ignored { private static readonly % = 1 }',
      'class Ignored { abstract % }',
      'class Ignored { declare % }',
      'class Ignored { #% }',
      'class Ignored { static #% }',
    ],
    options: {
      selector: 'classProperty',
    },
  },
  {
    code: ['const ignored = { % };', 'const ignored = { "%": 1 };'],
    options: {
      selector: 'objectLiteralProperty',
    },
  },
  {
    code: [
      'interface Ignored { % }',
      'interface Ignored { "%": string }',
      'type Ignored = { % }',
      'type Ignored = { "%": string }',
    ],
    options: {
      selector: 'typeProperty',
    },
  },
]);
