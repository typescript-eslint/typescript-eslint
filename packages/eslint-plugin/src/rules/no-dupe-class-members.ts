import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-dupe-class-members');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'no-dupe-class-members',
  meta: {
    type: 'problem',
    // defaultOptions, -- base rule does not use defaultOptions
    docs: {
      description: 'Disallow duplicate class members',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: baseRule.meta.schema,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    function wrapMemberDefinitionListener<
      N extends TSESTree.MethodDefinition | TSESTree.PropertyDefinition,
    >(coreListener: (node: N) => void): (node: N) => void {
      return (node: N): void => {
        if (node.computed) {
          return;
        }

        if (node.value?.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression) {
          return;
        }

        return coreListener(node);
      };
    }

    return {
      ...rules,
      'MethodDefinition, PropertyDefinition': wrapMemberDefinitionListener(
        rules['MethodDefinition, PropertyDefinition'],
      ),
    };
  },
});
