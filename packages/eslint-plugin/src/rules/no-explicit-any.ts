import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-explicit-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      unexpectedAny: 'Unexpected any. Specify a different type.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreRestArgs: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      ignoreRestArgs: false,
    },
  ],
  create(context, [{ ignoreRestArgs }]) {
    /**
     * Checks if the node parent is a function declaration
     * @param node the node to be validated.
     * @returns true if the node parent is a function declaration
     * @private
     */
    function isParentFunctionDeclaration(node: TSESTree.Node): boolean {
      return (
        typeof node.parent !== 'undefined' &&
        node.parent.type === AST_NODE_TYPES.FunctionDeclaration
      );
    }

    /**
     * Checks if the node great granparent is a rest element
     * @param node the node to be validated.
     * @returns true if the node great granparent is a rest element
     * @private
     */
    function isGreatGrandparentRestElementInFunctionDeclaration(
      node: TSESTree.Node,
    ): boolean {
      return (
        typeof node.parent !== 'undefined' &&
        typeof node.parent.parent !== 'undefined' &&
        typeof node.parent.parent.parent !== 'undefined' &&
        node.parent.parent.parent.type === AST_NODE_TYPES.RestElement &&
        isParentFunctionDeclaration(node.parent.parent.parent)
      );
    }

    return {
      TSAnyKeyword(node) {
        if (
          ignoreRestArgs &&
          isGreatGrandparentRestElementInFunctionDeclaration(node)
        ) {
          return;
        }
        context.report({
          node,
          messageId: 'unexpectedAny',
        });
      },
    };
  },
});
