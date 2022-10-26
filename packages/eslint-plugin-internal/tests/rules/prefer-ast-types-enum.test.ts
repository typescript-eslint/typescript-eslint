import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/prefer-ast-types-enum';
import { batchedSingleLineTests, RuleTester } from '../RuleTester';

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
    'node.type === DefinitionType.Parameter;',
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
node.type === 'Parameter';
    `,
    output: `
node.type === AST_NODE_TYPES.Literal;
node.type === AST_TOKEN_TYPES.Keyword;
node.type === DefinitionType.Parameter;
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
      {
        data: { enumName: 'DefinitionType', literal: DefinitionType.Parameter },
        messageId: 'preferEnum',
        line: 4,
      },
    ],
  }),
});
