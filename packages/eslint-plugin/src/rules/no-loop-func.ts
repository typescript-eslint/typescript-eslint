import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule: ReturnType<typeof getESLintCoreRule> =
  getESLintCoreRule('no-loop-func');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'no-loop-func',
  meta: {
    type: 'suggestion',
    // defaultOptions, -- base rule does not use defaultOptions
    deprecated: {
      deprecatedSince: '8.64.0',
      replacedBy: [
        {
          rule: {
            name: 'no-loop-func',
            url: 'https://eslint.org/docs/latest/rules/no-loop-func',
          },
        },
      ],
      url: 'https://github.com/typescript-eslint/typescript-eslint/issues/12496',
    },
    docs: {
      description:
        'Disallow function declarations that contain unsafe references inside loop statements',
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
