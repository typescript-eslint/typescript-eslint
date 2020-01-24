import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const isStringLiteral = (
  node: TSESTree.Literal,
): node is TSESTree.StringLiteral => typeof node.value === 'string';

export = ESLintUtils.RuleCreator(name => name)({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      recommended: 'error',
      description:
        'Ensures consistent usage of AST_NODE_TYPES & AST_TOKEN_TYPES.',
    },
    messages: {
      preferConstant: 'Prefer {{ constant }}.{{ literal }} over raw literal',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const report = (
      constant: 'AST_NODE_TYPES' | 'AST_TOKEN_TYPES',
      literal: TSESTree.StringLiteral,
    ): void =>
      context.report({
        data: { constant, literal: literal.value },
        messageId: 'preferConstant',
        node: literal,
        fix: fixer =>
          fixer.replaceText(literal, `${constant}.${literal.value}`),
      });

    return {
      Literal(node: TSESTree.Literal): void {
        if (!isStringLiteral(node)) {
          return;
        }

        const value = node.value;

        if (value in AST_NODE_TYPES) {
          report('AST_NODE_TYPES', node);
        }

        if (value in AST_TOKEN_TYPES) {
          report('AST_TOKEN_TYPES', node);
        }
      },
    };
  },
});
