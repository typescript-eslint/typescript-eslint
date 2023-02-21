import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('init-declarations');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'init-declarations',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require or disallow initialization in variable declarations',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],
  create(context, [mode]) {
    const rules = baseRule.create(context);

    return {
      'VariableDeclaration:exit'(node: TSESTree.VariableDeclaration): void {
        if (mode === 'always') {
          if (node.declare) {
            return;
          }
          if (isAncestorNamespaceDeclared(node)) {
            return;
          }
        }

        rules['VariableDeclaration:exit'](node);
      },
    };

    function isAncestorNamespaceDeclared(
      node: TSESTree.VariableDeclaration,
    ): boolean {
      let ancestor: TSESTree.Node | undefined = node.parent;

      while (ancestor) {
        if (
          ancestor.type === AST_NODE_TYPES.TSModuleDeclaration &&
          ancestor.declare
        ) {
          return true;
        }

        ancestor = ancestor.parent;
      }

      return false;
    }
  },
});
