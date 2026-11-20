import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'default-param-last',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce default parameters to be last',
      extendsBaseRule: true,
      frozen: true,
    },
    messages: {
      shouldBeLast: 'Default parameters should be last.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    function checkDefaultParamLast(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      let hasSeenPlainParam = false;
      for (let i = node.params.length - 1; i >= 0; i--) {
        const current = node.params[i];
        const param =
          current.type === AST_NODE_TYPES.TSParameterProperty
            ? current.parameter
            : current;

        if (
          param.type !== AST_NODE_TYPES.AssignmentPattern &&
          param.type !== AST_NODE_TYPES.RestElement &&
          !param.optional
        ) {
          hasSeenPlainParam = true;
        } else if (hasSeenPlainParam) {
          context.report({ node: current, messageId: 'shouldBeLast' });
        }
      }
    }

    return {
      ArrowFunctionExpression: checkDefaultParamLast,
      FunctionDeclaration: checkDefaultParamLast,
      FunctionExpression: checkDefaultParamLast,
    };
  },
});
