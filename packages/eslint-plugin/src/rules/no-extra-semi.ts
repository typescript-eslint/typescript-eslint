import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-extra-semi');

type Options = InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'no-extra-semi',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unnecessary semicolons',
      extendsBaseRule: true,
    },
    fixable: 'code',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    return {
      ...rules,
      'TSAbstractMethodDefinition, TSAbstractPropertyDefinition'(
        node: never,
      ): void {
        if (rules.MethodDefinition) {
          // for ESLint <= v7
          rules.MethodDefinition(node);
        } else if (rules['MethodDefinition, PropertyDefinition']) {
          // for ESLint >= v8 < v8.3.0
          rules['MethodDefinition, PropertyDefinition'](node);
        } else {
          // for ESLint >= v8.3.0
          rules['MethodDefinition, PropertyDefinition, StaticBlock']?.(node);
        }
      },
    };
  },
});
