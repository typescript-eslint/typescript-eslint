import { createRule } from '../util';
import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';

export default createRule({
  name: 'default-param-last',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce default parameters to be last',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [],
    messages: {
      shouldBeLast: 'Default parameters should be last.',
    },
  },
  defaultOptions: [],
  create(context) {
    /**
     * checks if node is optional parameter
     * @param node the node to be evaluated
     * @private
     */
    function isOptionalParam(node: TSESTree.Parameter): boolean {
      return 'optional' in node && node.optional === true;
    }

    /**
     * checks if node is plain parameter
     * @param node the node to be evaluated
     * @private
     */
    function isPlainParam(node: TSESTree.Parameter): boolean {
      return !(
        node.type === AST_NODE_TYPES.AssignmentPattern ||
        node.type === AST_NODE_TYPES.RestElement ||
        isOptionalParam(node)
      );
    }

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

        if (isPlainParam(param)) {
          hasSeenPlainParam = true;
          continue;
        }

        if (
          hasSeenPlainParam &&
          (isOptionalParam(param) ||
            param.type === AST_NODE_TYPES.AssignmentPattern)
        ) {
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
