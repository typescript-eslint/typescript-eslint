import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  create(context) {
    function compareTypes(
      valueNode: TSESTree.Expression,
      typeNode: TSESTree.TypeNode,
      canFix: boolean,
    ): void {
      if (
        valueNode.type === AST_NODE_TYPES.Literal &&
        typeNode.type === AST_NODE_TYPES.TSLiteralType &&
        typeNode.literal.type === AST_NODE_TYPES.Literal &&
        valueNode.raw === typeNode.literal.raw
      ) {
        if (canFix) {
          context.report({
            fix: fixer => fixer.replaceText(typeNode, 'const'),
            messageId: 'preferConstAssertion',
            node: typeNode,
          });
        } else {
          context.report({
            messageId: 'variableConstAssertion',
            node: typeNode,
            suggest: [
              {
                fix: (fixer): TSESLint.RuleFix[] => [
                  fixer.remove(typeNode.parent),
                  fixer.insertTextAfter(valueNode, ' as const'),
                ],
                messageId: 'variableSuggest',
              },
            ],
          });
        }
      }
    }

    return {
      PropertyDefinition(node): void {
        if (node.value && node.typeAnnotation) {
          compareTypes(node.value, node.typeAnnotation.typeAnnotation, false);
        }
      },
      TSAsExpression(node): void {
        compareTypes(node.expression, node.typeAnnotation, true);
      },
      TSTypeAssertion(node): void {
        compareTypes(node.expression, node.typeAnnotation, true);
      },
      VariableDeclarator(node): void {
        if (node.init && node.id.typeAnnotation) {
          compareTypes(node.init, node.id.typeAnnotation.typeAnnotation, false);
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the use of `as const` over literal type',
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      preferConstAssertion:
        'Expected a `const` instead of a literal type assertion.',
      variableConstAssertion:
        'Expected a `const` assertion instead of a literal type annotation.',
      variableSuggest: 'You should use `as const` instead of type annotation.',
    },
    schema: [],
  },
  name: 'prefer-as-const',
});
