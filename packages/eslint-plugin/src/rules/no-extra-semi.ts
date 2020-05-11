import baseRule from 'eslint/lib/rules/no-extra-semi';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-extra-semi',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unnecessary semicolons',
      category: 'Possible Errors',
      recommended: 'error',
      extendsBaseRule: true,
    },
    fixable: 'code',
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    return {
      ...rules,
      ClassProperty(node): void {
        rules.MethodDefinition(node as never);
      },
    };
  },
});
