import rule from '../../src/rules/prefer-ast-types-constant';
import { RuleTester, batchedSingleLineTests } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('prefer-ast-types-constant', rule, {
  valid: [
    'node.type === AST_NODE_TYPES.Literal',
    'node.type === AST_TOKEN_TYPES.Keyword',
    'node.type === 1',
    `
    enum AST_NODE_TYPES {
      Literal = 'Literal'
    }
    `,
  ],
  invalid: batchedSingleLineTests({
    code: `
node.type === 'Literal'
node.type === 'Keyword'
    `,
    output: `
node.type === AST_NODE_TYPES.Literal
node.type === AST_TOKEN_TYPES.Keyword
    `,
    errors: [
      {
        data: { constant: 'AST_NODE_TYPES', literal: 'Literal' },
        messageId: 'preferConstant',
        line: 2,
      },
      {
        data: { constant: 'AST_TOKEN_TYPES', literal: 'Keyword' },
        messageId: 'preferConstant',
        line: 3,
      },
    ],
  }),
});
