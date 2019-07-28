import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-empty-function';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-empty-function',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow empty functions',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      allow: [],
    },
  ],
  create(context) {
    const rules = baseRule.create(context);

    /**
     * Checks if the node is a constructor
     * @param node the node to ve validated
     * @returns true if the node is a constructor
     * @private
     */
    function isConstructor(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      return !!(
        node.parent &&
        node.parent.type === 'MethodDefinition' &&
        node.parent.kind === 'constructor'
      );
    }

    /**
     * Check if the method body is empty
     * @param node the node to be validated
     * @returns true if the body is empty
     * @private
     */
    function isBodyEmpty(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      return !node.body || node.body.body.length === 0;
    }

    /**
     * Check if method has parameter properties
     * @param node the node to be validated
     * @returns true if the body has parameter properties
     * @private
     */
    function hasParameterProperties(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      return (
        node.params &&
        node.params.some(
          param => param.type === AST_NODE_TYPES.TSParameterProperty,
        )
      );
    }

    /**
     * Checks if the method is a concise constructor (no function body, but has parameter properties)
     * @param node the node to be validated
     * @returns true if the method is a concise constructor
     * @private
     */
    function isConciseConstructor(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): boolean {
      // Check TypeScript specific nodes
      return (
        isConstructor(node) && isBodyEmpty(node) && hasParameterProperties(node)
      );
    }

    return {
      FunctionDeclaration(node): void {
        if (!isConciseConstructor(node)) {
          rules.FunctionDeclaration(node);
        }
      },
      FunctionExpression(node): void {
        if (!isConciseConstructor(node)) {
          rules.FunctionExpression(node);
        }
      },
    };
  },
});
