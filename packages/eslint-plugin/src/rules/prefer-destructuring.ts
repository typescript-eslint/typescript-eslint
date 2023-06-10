import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('prefer-destructuring');

type Options = InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'prefer-destructuring',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require destructuring from arrays and/or objects',
      recommended: false,
      extendsBaseRule: true,
      requiresTypeChecking: false,
    },
    schema: baseRule.meta?.schema,
    fixable: baseRule.meta?.fixable,
    hasSuggestions: baseRule.meta?.hasSuggestions,
    messages: baseRule.meta?.messages,
  },
  defaultOptions: [
    {
      VariableDeclarator: {
        array: true,
        object: true,
      },
      AssignmentExpression: {
        array: true,
        object: true,
      },
    },
    {
      enforceForRenamedProperties: false,
    },
  ],
  create(context) {
    const rules = baseRule.create(context);
    return {
      ...rules,
    };
  },
});
