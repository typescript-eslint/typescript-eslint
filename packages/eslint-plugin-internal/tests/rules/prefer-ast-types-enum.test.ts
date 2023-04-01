import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/prefer-ast-types-enum';
import { RuleTester } from '@typescript-eslint/rule-tester';

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
  invalid: [
    {
      code: "node.type === 'Literal';",
      output: 'node.type === AST_NODE_TYPES.Literal;',
      errors: [
        {
          data: { enumName: 'AST_NODE_TYPES', literal: AST_NODE_TYPES.Literal },
          messageId: 'preferEnum',
        },
      ],
    },
    {
      code: "node.type === 'Keyword';",
      output: 'node.type === AST_TOKEN_TYPES.Keyword;',
      errors: [
        {
          data: {
            enumName: 'AST_TOKEN_TYPES',
            literal: AST_TOKEN_TYPES.Keyword,
          },
          messageId: 'preferEnum',
        },
      ],
    },
    {
      code: "node.type === 'Parameter';",
      output: 'node.type === DefinitionType.Parameter;',
      errors: [
        {
          data: {
            enumName: 'DefinitionType',
            literal: DefinitionType.Parameter,
          },
          messageId: 'preferEnum',
        },
      ],
    },
  ],
});
