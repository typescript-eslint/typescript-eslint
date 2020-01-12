import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { RuleFix } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-as-const',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer usage of `as const` over literal type',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferAsConst: 'Expected a `const` instead of a `type literal`',
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
        context.report({
          node: typeNode,
          messageId: 'preferAsConst',
          fix: canFix
            ? (fixer): RuleFix => fixer.replaceText(typeNode, 'const')
            : undefined,
        });
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
