import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-loss-of-precision');

type Options = InferOptionsTypeFromRule<NonNullable<typeof baseRule>>;
type MessageIds = InferMessageIdsTypeFromRule<NonNullable<typeof baseRule>>;

export default createRule<Options, MessageIds>({
  create(context) {
    return baseRule.create(context);
  },
  defaultOptions: [],
  meta: {
    deprecated: true,
    docs: {
      description: 'Disallow literal numbers that lose precision',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: [],
    type: 'problem',
  },
  name: 'no-loss-of-precision',
});
