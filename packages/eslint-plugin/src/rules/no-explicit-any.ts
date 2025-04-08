import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type Options = [
  {
    fixToUnknown?: boolean;
    ignoreRestArgs?: boolean;
  },
];
export type MessageIds =
  | 'suggestNever'
  | 'suggestPropertyKey'
  | 'suggestUnknown'
  | 'unexpectedAny';

export default createRule<Options, MessageIds>({
  name: 'no-explicit-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the `any` type',
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      suggestNever:
        "Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of.",
      suggestPropertyKey:
        'Use `PropertyKey` instead, this is more explicit than `keyof any`.',
      suggestUnknown:
        'Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct.',
      unexpectedAny: 'Unexpected any. Specify a different type.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          fixToUnknown: {
            type: 'boolean',
            description:
              'Whether to enable auto-fixing in which the `any` type is converted to the `unknown` type.',
          },
          ignoreRestArgs: {
            type: 'boolean',
            description: 'Whether to ignore rest parameter arrays.',
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
  create(context, [{ fixToUnknown, ignoreRestArgs }]) {
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
        AST_NODE_TYPES.TSCallSignatureDeclaration, // type T = {(...args: any[]): unknown};
        AST_NODE_TYPES.TSConstructorType, // type T = new (...args: any[]) => unknown
        AST_NODE_TYPES.TSConstructSignatureDeclaration, // type T = {new (...args: any[]): unknown};
        AST_NODE_TYPES.TSDeclareFunction, // declare function _8(...args: any[]): unknown;
        AST_NODE_TYPES.TSEmptyBodyFunctionExpression, // declare class A { f(...args: any[]): unknown; }
        AST_NODE_TYPES.TSFunctionType, // type T = (...args: any[]) => unknown;
        AST_NODE_TYPES.TSMethodSignature, // type T = {f(...args: any[]): unknown};
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
        node.parent?.parent?.parent != null &&
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

    /**
     * Checks if the node is within a keyof any expression
     * @param node the node to be validated.
     * @returns true if the node is within a keyof any expression, false otherwise
     * @private
     */
    function isNodeWithinKeyofAny(node: TSESTree.Node): boolean {
      return (
        node.parent?.type === AST_NODE_TYPES.TSTypeOperator &&
        node.parent.operator === 'keyof'
      );
    }

    /**
     * Creates a fixer that replaces a keyof any with PropertyKey
     * @param node the node to be fixed.
     * @returns a function that will fix the node.
     * @private
     */
    function createPropertyKeyFixer(node: TSESTree.TSAnyKeyword) {
      return (fixer: TSESLint.RuleFixer) => {
        return fixer.replaceText(node.parent, 'PropertyKey');
      };
    }

    return {
      TSAnyKeyword(node): void {
        const isKeyofAny = isNodeWithinKeyofAny(node);

        if (ignoreRestArgs && isNodeDescendantOfRestElementInFunction(node)) {
          return;
        }

        const propertyKeySuggestion: TSESLint.SuggestionReportDescriptor<MessageIds> =
          {
            messageId: 'suggestPropertyKey',
            fix: createPropertyKeyFixer(node),
          };

        const unknownSuggestion: TSESLint.SuggestionReportDescriptor<MessageIds> =
          {
            messageId: 'suggestUnknown',
            fix: fixer => fixer.replaceText(node, 'unknown'),
          };

        const neverSuggestion: TSESLint.SuggestionReportDescriptor<MessageIds> =
          {
            messageId: 'suggestNever',
            fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
              return fixer.replaceText(node, 'never');
            },
          };

        const fixOrSuggest: {
          fix: TSESLint.ReportFixFunction | null;
          suggest: TSESLint.ReportSuggestionArray<MessageIds> | null;
        } = {
          fix: null,
          suggest: isKeyofAny
            ? [propertyKeySuggestion]
            : [unknownSuggestion, neverSuggestion],
        };

        if (fixToUnknown) {
          fixOrSuggest.fix = isKeyofAny
            ? createPropertyKeyFixer(node)
            : fixer => fixer.replaceText(node, 'unknown');
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
