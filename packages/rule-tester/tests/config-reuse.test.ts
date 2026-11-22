import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';

import type { InvalidTestCase } from '../src';

import { RuleTester } from '../src/RuleTester';

// Test cases with deeply equal configs share a normalized config array, so make sure that
// configs that only differ slightly (options, settings, language options) are never mixed up.
const rule: RuleModule<'options', [number?]> = {
  create: context => ({
    Program(node): void {
      context.report({
        data: {
          globalReturn: String(
            context.languageOptions.parserOptions.ecmaFeatures?.globalReturn,
          ),
          options: JSON.stringify(context.options),
          settings: JSON.stringify(context.settings),
        },
        messageId: 'options',
        node,
      });
    },
  }),
  meta: {
    messages: { options: '{{options}} {{settings}} {{globalReturn}}' },
    schema: [{ type: 'number' }],
    type: 'problem',
  },
};

const cases: (Omit<InvalidTestCase<'options', [number?]>, 'code' | 'errors'> & {
  data: Record<string, string>;
})[] = [
  { data: { options: '[1]' }, options: [1] },
  { data: { options: '[2]' }, options: [2] },
  {
    data: { options: '[1]', settings: '{"a":1}' },
    options: [1],
    settings: { a: 1 },
  },
  {
    data: { globalReturn: 'true', options: '[1]' },
    languageOptions: {
      parserOptions: { ecmaFeatures: { globalReturn: true } },
    },
    options: [1],
  },
  { data: { options: '[]' } },
  { data: { options: '[1]' }, options: [1] },
];

new RuleTester().run('config-reuse', rule, {
  invalid: cases.flatMap(({ data, ...config }, i) =>
    // Twice each, so that every config is also reused
    [`a${i}`, `b${i}`].map(code => ({
      ...config,
      code,
      errors: [
        {
          data: { globalReturn: 'undefined', settings: '{}', ...data },
          messageId: 'options',
        },
      ],
    })),
  ),
  valid: [],
});
