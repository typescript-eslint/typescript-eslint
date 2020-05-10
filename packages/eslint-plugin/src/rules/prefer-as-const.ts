import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-as-const',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer usage of `as const` over literal type',
      category: 'Best Practices',
      recommended: 'error',
      suggestion: true,
    },
    fixable: 'code',
    messages: {
      preferConstAssertion:
        'Expected a `const` instead of a literal type assertion.',
      variableConstAssertion:
        'Expected a `const` assertion instead of a literal type annotation.',
      variableSuggest: 'You should use `as const` instead of type annotation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function compareTypes(
      valueNode: TSESTree.Expression,
      typeNode: TSESTree.TypeNode,
      canFix: boolean,
    ): void {
      if (
        valueNode.type === AST_NODE_TYPES.Literal &&
        typeNode.type === AST_NODE_TYPES.TSLiteralType &&
        'raw' in typeNode.literal &&
        valueNode.raw === typeNode.literal.raw
      ) {
        if (canFix) {
          context.report({
            node: typeNode,
            messageId: 'preferConstAssertion',
            fix: fixer => fixer.replaceText(typeNode, 'const'),
          });
        } else {
          context.report({
            node: typeNode,
            messageId: 'variableConstAssertion',
            suggest: [
              {
                messageId: 'variableSuggest',
                fix: (fixer): TSESLint.RuleFix[] => [
                  fixer.remove(typeNode.parent!),
                  fixer.insertTextAfter(valueNode, ' as const'),
                ],
              },
            ],
          });
        }
      }
    }

    return {
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
});
