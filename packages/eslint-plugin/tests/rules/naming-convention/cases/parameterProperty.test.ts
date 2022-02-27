import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'class Ignored { constructor(private %) {} }',
      'class Ignored { constructor(readonly %) {} }',
      'class Ignored { constructor(private readonly %) {} }',
    ],
    options: {
      selector: 'parameterProperty',
    },
  },
  {
    code: ['class Ignored { constructor(private readonly %) {} }'],
    options: {
      selector: 'parameterProperty',
      modifiers: ['readonly'],
    },
  },
]);
