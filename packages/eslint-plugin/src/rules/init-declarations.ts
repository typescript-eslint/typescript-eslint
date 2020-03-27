import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/init-declarations';
import * as util from '../util';

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = util.deepMerge(
  Array.isArray(baseRule.meta.schema)
    ? baseRule.meta.schema[0]
    : baseRule.meta.schema,
);

export default util.createRule<Options, MessageIds>({
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
  create(context, [options]) {
    const rules = baseRule.create(context);
    const mode = context.options[0] || 'always';
    const ignoreForLoopInit = context.options[1]?.ignoreForLoopInit || false;

    return {
      'VariableDeclaration:exit'(node: TSESTree.VariableDeclaration): void {
        if (mode === 'always') {
          if (node?.declare) {
            return;
          }
          if (
            node?.parent.type === AST_NODE_TYPES.TSModuleBlock &&
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
