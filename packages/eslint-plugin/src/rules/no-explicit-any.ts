import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import { TSESLint } from '@typescript-eslint/experimental-utils';

export type Options = [
  {
    fixToUnknown?: boolean;
    ignoreRestArgs?: boolean;
  },
];
export type MessageIds = 'unexpectedAny';

export default util.createRule<Options, MessageIds>({
  name: 'no-explicit-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      category: 'Best Practices',
      recommended: 'warn',
    },
    fixable: 'code',
    messages: {
      unexpectedAny: 'Unexpected any. Specify a different type.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          fixToUnknown: {
            type: 'boolean',
          },
          ignoreRestArgs: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      fixToUnknown: false,
      ignoreRestArgs: false,
    },
  ],
  create(context, [{ ignoreRestArgs, fixToUnknown }]) {
    /**
     * Checks if the node is an arrow function, function declaration or function expression
     * @param node the node to be validated.
     * @returns true if the node is an arrow function, function declaration, function expression, function type, or call signature
     * @private
     */
    function isNodeValidFunction(node: TSESTree.Node): boolean {
      return [
        AST_NODE_TYPES.ArrowFunctionExpression,
        AST_NODE_TYPES.FunctionDeclaration,
        AST_NODE_TYPES.FunctionExpression,
        AST_NODE_TYPES.TSFunctionType,
        AST_NODE_TYPES.TSCallSignatureDeclaration,
      ].includes(node.type);
    }

    /**
     * Checks if the node is a rest element child node of a function
     * @param node the node to be validated.
     * @returns true if the node is a rest element child node of a function
     * @private
     */
    function isNodeRestElementInFunction(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.RestElement &&
        typeof node.parent !== 'undefined' &&
        isNodeValidFunction(node.parent)
      );
    }

    /**
     * Checks if the node is a TSTypeOperator node with a readonly operator
     * @param node the node to be validated.
     * @returns true if the node is a TSTypeOperator node with a readonly operator
     * @private
     */
    function isNodeReadonlyTSTypeOperator(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.TSTypeOperator &&
        node.operator === 'readonly'
      );
    }

    /**
     * Checks if the node is a TSTypeReference node with an Array identifier
     * @param node the node to be validated.
     * @returns true if the node is a TSTypeReference node with an Array identifier
     * @private
     */
    function isNodeValidArrayTSTypeReference(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.TSTypeReference &&
        typeof node.typeName !== 'undefined' &&
        node.typeName.type === AST_NODE_TYPES.Identifier &&
        ['Array', 'ReadonlyArray'].includes(node.typeName.name)
      );
    }

    /**
     * Checks if the node is a valid TSTypeOperator or TSTypeReference node
     * @param node the node to be validated.
     * @returns true if the node is a valid TSTypeOperator or TSTypeReference node
     * @private
     */
    function isNodeValidTSType(node: TSESTree.Node): boolean {
      return (
        isNodeReadonlyTSTypeOperator(node) ||
        isNodeValidArrayTSTypeReference(node)
      );
    }

    /**
     * Checks if the great grand-parent node is a RestElement node in a function
     * @param node the node to be validated.
     * @returns true if the great grand-parent node is a RestElement node in a function
     * @private
     */
    function isGreatGrandparentRestElement(node: TSESTree.Node): boolean {
      return (
        typeof node.parent !== 'undefined' &&
        typeof node.parent.parent !== 'undefined' &&
        typeof node.parent.parent.parent !== 'undefined' &&
        isNodeRestElementInFunction(node.parent.parent.parent)
      );
    }

    /**
     * Checks if the great great grand-parent node is a valid RestElement node in a function
     * @param node the node to be validated.
     * @returns true if the great great grand-parent node is a valid RestElement node in a function
     * @private
     */
    function isGreatGreatGrandparentRestElement(node: TSESTree.Node): boolean {
      return (
        typeof node.parent !== 'undefined' &&
        typeof node.parent.parent !== 'undefined' &&
        isNodeValidTSType(node.parent.parent) &&
        typeof node.parent.parent.parent !== 'undefined' &&
        typeof node.parent.parent.parent.parent !== 'undefined' &&
        isNodeRestElementInFunction(node.parent.parent.parent.parent)
      );
    }

    /**
     * Checks if the great grand-parent or the great great grand-parent node is a RestElement node
     * @param node the node to be validated.
     * @returns true if the great grand-parent or the great great grand-parent node is a RestElement node
     * @private
     */
    function isNodeDescendantOfRestElementInFunction(
      node: TSESTree.Node,
    ): boolean {
      return (
        isGreatGrandparentRestElement(node) ||
        isGreatGreatGrandparentRestElement(node)
      );
    }

    return {
      TSAnyKeyword(node): void {
        if (ignoreRestArgs && isNodeDescendantOfRestElementInFunction(node)) {
          return;
        }

        let fix: TSESLint.ReportFixFunction | null = null;

        if (fixToUnknown) {
          fix = (fixer =>
            fixer.replaceText(node, 'unknown')) as TSESLint.ReportFixFunction;
        }

        context.report({
          node,
          messageId: 'unexpectedAny',
          fix,
        });
      },
    };
  },
});
