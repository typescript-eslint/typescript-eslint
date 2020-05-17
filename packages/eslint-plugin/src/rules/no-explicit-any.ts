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
export type MessageIds = 'unexpectedAny' | 'suggestUnknown' | 'suggestNever';

export default util.createRule<Options, MessageIds>({
  name: 'no-explicit-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      category: 'Best Practices',
      recommended: 'warn',
      suggestion: true,
    },
    fixable: 'code',
    messages: {
      unexpectedAny: 'Unexpected any. Specify a different type.',
      suggestUnknown:
        'Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.',
      suggestNever:
        "Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of.",
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
     * Checks if the node is an arrow function, function/constructor declaration or function expression
     * @param node the node to be validated.
     * @returns true if the node is any kind of function declaration or expression
     * @private
     */
    function isNodeValidFunction(node: TSESTree.Node): boolean {
      return [
        AST_NODE_TYPES.ArrowFunctionExpression, // const x = (...args: any[]) => {};
        AST_NODE_TYPES.FunctionDeclaration, // function f(...args: any[]) {}
        AST_NODE_TYPES.FunctionExpression, // const x = function(...args: any[]) {};
        AST_NODE_TYPES.TSEmptyBodyFunctionExpression, // declare class A { f(...args: any[]): unknown; }
        AST_NODE_TYPES.TSFunctionType, // type T = (...args: any[]) => unknown;
        AST_NODE_TYPES.TSConstructorType, // type T = new (...args: any[]) => unknown
        AST_NODE_TYPES.TSCallSignatureDeclaration, // type T = {(...args: any[]): unknown};
        AST_NODE_TYPES.TSConstructSignatureDeclaration, // type T = {new (...args: any[]): unknown};
        AST_NODE_TYPES.TSMethodSignature, // type T = {f(...args: any[]): unknown};
        AST_NODE_TYPES.TSDeclareFunction, // declare function _8(...args: any[]): unknown;
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
        node?.parent?.parent?.parent != null &&
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
        node.parent?.parent?.parent?.parent != null &&
        isNodeValidTSType(node.parent.parent) &&
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

        const fixOrSuggest: {
          fix: TSESLint.ReportFixFunction | null;
          suggest: TSESLint.ReportSuggestionArray<MessageIds> | null;
        } = {
          fix: null,
          suggest: [
            {
              messageId: 'suggestUnknown',
              fix(fixer): TSESLint.RuleFix {
                return fixer.replaceText(node, 'unknown');
              },
            },
            {
              messageId: 'suggestNever',
              fix(fixer): TSESLint.RuleFix {
                return fixer.replaceText(node, 'never');
              },
            },
          ],
        };

        if (fixToUnknown) {
          fixOrSuggest.fix = (fixer =>
            fixer.replaceText(node, 'unknown')) as TSESLint.ReportFixFunction;
        }

        context.report({
          node,
          messageId: 'unexpectedAny',
          ...fixOrSuggest,
        });
      },
    };
  },
});
