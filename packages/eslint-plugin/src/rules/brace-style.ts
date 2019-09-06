import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/brace-style';
import * as util from '../util';

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'brace-style',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent brace style for blocks',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: baseRule.meta.messages,
    fixable: baseRule.meta.fixable,
    schema: baseRule.meta.schema,
  },
  defaultOptions: ['1tbs'],
  create(context) {
    const rules = baseRule.create(context);
    const checkBlockStatement = (
      node: TSESTree.TSModuleBlock | TSESTree.TSInterfaceBody,
    ): void => {
      rules.BlockStatement({
        type: AST_NODE_TYPES.BlockStatement,
        parent: node.parent,
        range: node.range,
        body: node.body as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loc: node.loc,
      });
    };

    return {
      ...rules,
      TSInterfaceBody: checkBlockStatement,
      TSModuleBlock: checkBlockStatement,
    };
  },
});
