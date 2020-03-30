import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/init-declarations';
import {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
  createRule,
  deepMerge,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = deepMerge(
  Array.isArray(baseRule.meta.schema)
    ? baseRule.meta.schema[0]
    : baseRule.meta.schema,
);

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
    schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],
  create(context) {
    const rules = baseRule.create(context);
    const mode = context.options[0] || 'always';

    return {
      'VariableDeclaration:exit'(
        node: TSESTree.VariableDeclaration,
      ): void {
        if (mode === 'always') {
          if (node?.declare) {
            return;
          }
          if (
            node?.parent?.type === AST_NODE_TYPES.TSModuleBlock &&
            node?.parent?.parent?.declare
          ) {
            return;
          }
        }

        rules['VariableDeclaration:exit'](node);
      },
    };
  },
});
