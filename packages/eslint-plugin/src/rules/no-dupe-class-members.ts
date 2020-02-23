import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-dupe-class-members';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-dupe-class-members',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate class members',
      category: 'Possible Errors',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    return {
      ...rules,
      MethodDefinition(node): void {
        if (node.computed) {
          return;
        }

        if (node.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression) {
          return;
        }

        return rules.MethodDefinition(node);
      },
    };
  },
});
