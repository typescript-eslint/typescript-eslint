import rule from '../../src/rules/semi';
import { RuleTester } from '../RuleTester';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

// the base rule doesn't use a message id...
const missingError: any = {
  message: 'Missing semicolon.',
};

const extraSemicolon: any = {
  message: 'Extra semicolon.',
};

ruleTester.run<MessageIds, Options>('semi', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    { code: 'type Foo = {}', options: ['never'] },
    'type Foo = {};',
    // https://github.com/typescript-eslint/typescript-eslint/issues/409
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false;
    }
    `,
    },
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false
    }
    `,
      options: ['never'],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/123
    'export default interface test {}',
    // ESLint
    {
      code: 'if (foo) { bar(); }',
      options: ['always', { omitLastInOneLineBlock: false }],
    },
    {
      code: 'if (foo) { bar(); baz(); }',
      options: ['always', { omitLastInOneLineBlock: false }],
    },
    {
      code: 'if (foo) { bar() }',
      options: ['always', { omitLastInOneLineBlock: true }],
    },
    {
      code: 'if (foo) { bar(); baz() }',
      options: ['always', { omitLastInOneLineBlock: true }],
    },
  ],
  invalid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    {
      code: 'type Foo = {};',
      options: ['never'] as Options,
      errors: [extraSemicolon],
    },
    {
      code: 'type Foo = {}',
      errors: [missingError],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/409
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false
    }
    `,
      errors: [missingError],
    },
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false;
    }
    `,
      options: ['never'] as Options,
      errors: [extraSemicolon],
    },
    // ESLint
    {
      code: 'if (foo) { bar() }',
      options: ['always', { omitLastInOneLineBlock: false }] as Options,
      errors: [missingError],
    },
    {
      code: 'if (foo) { bar(); baz() }',
      options: ['always', { omitLastInOneLineBlock: false }] as Options,
      errors: [missingError],
    },
    {
      code: 'if (foo) { bar(); }',
      options: ['always', { omitLastInOneLineBlock: true }] as Options,
      errors: [extraSemicolon],
    },
    {
      code: 'if (foo) { bar(); baz(); }',
      options: ['always', { omitLastInOneLineBlock: true }] as Options,
      errors: [extraSemicolon],
    },
    {
      code: `
import a from "a"

(function() {
    // ...
})()
`,
      options: [
        'never',
        { beforeStatementContinuationChars: 'always' },
      ] as Options,
      errors: [missingError],
    },
    {
      code: `
import a from "a"

;(function() {
    // ...
})()
`,
      options: [
        'never',
        { beforeStatementContinuationChars: 'never' },
      ] as Options,
      errors: [extraSemicolon],
    },
  ],
});
