import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/prefer-ast-types-enum';
import { RuleTester, batchedSingleLineTests } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('prefer-ast-types-enum', rule, {
  valid: [
    "node.type === 'constructor';",
    'node.type === AST_NODE_TYPES.Literal;',
    'node.type === AST_TOKEN_TYPES.Keyword;',
    'node.type === 1;',
    `
      enum MY_ENUM {
        Literal = 1,
      }
    `,
    `
      enum AST_NODE_TYPES {
        Literal = 'Literal',
      }
    `,
  ],
  invalid: batchedSingleLineTests({
    code: `
node.type === 'Literal';
node.type === 'Keyword';
    `,
    output: `
node.type === AST_NODE_TYPES.Literal;
node.type === AST_TOKEN_TYPES.Keyword;
    `,
    errors: [
      {
        data: { enumName: 'AST_NODE_TYPES', literal: AST_NODE_TYPES.Literal },
        messageId: 'preferEnum',
        line: 2,
      },
      {
        data: { enumName: 'AST_TOKEN_TYPES', literal: AST_TOKEN_TYPES.Keyword },
        messageId: 'preferEnum',
        line: 3,
      },
    ],
  }),
});
