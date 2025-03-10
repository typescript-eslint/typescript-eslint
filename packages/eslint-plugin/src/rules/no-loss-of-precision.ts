import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule: ReturnType<typeof getESLintCoreRule> = getESLintCoreRule(
  'no-loss-of-precision',
);

export type Options = InferOptionsTypeFromRule<NonNullable<typeof baseRule>>;
export type MessageIds = InferMessageIdsTypeFromRule<
  NonNullable<typeof baseRule>
>;

export default createRule<Options, MessageIds>({
  name: 'no-loss-of-precision',
  meta: {
    type: 'problem',
    // defaultOptions, -- base rule does not use defaultOptions
    deprecated: {
      deprecatedSince: '8.0.0',
      replacedBy: [
        {
          rule: {
            name: 'no-loss-of-precision',
            url: 'https://eslint.org/docs/latest/rules/no-loss-of-precision',
          },
        },
      ],
      url: 'https://github.com/typescript-eslint/typescript-eslint/pull/8832',
    },
    docs: {
      description: 'Disallow literal numbers that lose precision',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return baseRule.create(context);
  },
});
