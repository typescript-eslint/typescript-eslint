import type { TSESTree } from '@typescript-eslint/utils';

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
  name: 'no-loss-of-precision',
  meta: {
    type: 'problem',
    deprecated: true,
    docs: {
      description: 'Disallow literal numbers that lose precision',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: [],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    function isSeparatedNumeric(node: TSESTree.Literal): boolean {
      return typeof node.value === 'number' && node.raw.includes('_');
    }
    return {
      Literal(node: TSESTree.Literal): void {
        rules.Literal({
          ...node,
          raw: isSeparatedNumeric(node) ? node.raw.replace(/_/g, '') : node.raw,
        } as never);
      },
    };
  },
});
