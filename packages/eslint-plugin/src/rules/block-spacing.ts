import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('block-spacing');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'block-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing before and after keywords',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],

  create(context, [whenToApplyOption]) {
    const sourceCode = context.getSourceCode();
    const baseRules = baseRule.create(context);
    return {
      ...baseRules,
      // TSInterfaceBody(node): void {},
      // TSTypeLiteral(node): void {},

      TSInterfaceBody: baseRules.BlockStatement as never,
      TSTypeLiteral: baseRules.BlockStatement as never,
    };
  },
});
