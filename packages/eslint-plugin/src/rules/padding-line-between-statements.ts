import baseRule from 'eslint/lib/rules/padding-line-between-statements';
import {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
  createRule,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'padding-line-between-statements',
  meta: {
    type: 'layout',
    docs: {
      description: 'require or disallow padding lines between statements',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages ?? {
      unexpectedBlankLine: 'Unexpected blank line before this statement.',
      expectedBlankLine: 'Expected blank line before this statement',
    },
  },
  defaultOptions: [{ blankLine: 'any', prev: '*', next: '*' }],
  create(context) {
    const rules = baseRule.create(context);
    return {
      ...rules,
    };
  },
});
