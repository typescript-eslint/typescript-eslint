import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
  createRule,
} from '../util';

const baseRule = getESLintCoreRule('init-declarations');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'init-declarations',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require or disallow initialization in variable declarations',
      category: 'Variables',
      recommended: false,
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],
  create(context) {
    const rules = baseRule.create(context);
    const mode = context.options[0] || 'always';

    return {
      'VariableDeclaration:exit'(node: TSESTree.VariableDeclaration): void {
        if (mode === 'always') {
          if (node.declare) {
            return;
          }
          if (
            node.parent?.type === AST_NODE_TYPES.TSModuleBlock &&
            node.parent.parent?.type === AST_NODE_TYPES.TSModuleDeclaration &&
            node.parent.parent?.declare
          ) {
            return;
          }
        }

        rules['VariableDeclaration:exit'](node);
      },
    };
  },
});
