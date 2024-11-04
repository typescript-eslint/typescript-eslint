import { RuleTester } from '@typescript-eslint/rule-tester';
import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/prefer-ast-types-enum';

const ruleTester = new RuleTester();

ruleTester.run('prefer-ast-types-enum', rule, {
  invalid: [
    {
      code: "node.type === 'Literal';",
      errors: [
        {
          data: { enumName: 'AST_NODE_TYPES', literal: AST_NODE_TYPES.Literal },
          messageId: 'preferEnum',
        },
      ],
      output: 'node.type === AST_NODE_TYPES.Literal;',
    },
    {
      code: "node.type === 'Keyword';",
      errors: [
        {
          data: {
            enumName: 'AST_TOKEN_TYPES',
            literal: AST_TOKEN_TYPES.Keyword,
          },
          messageId: 'preferEnum',
        },
      ],
      output: 'node.type === AST_TOKEN_TYPES.Keyword;',
    },
    {
      code: "node.type === 'Parameter';",
      errors: [
        {
          data: {
            enumName: 'DefinitionType',
            literal: DefinitionType.Parameter,
          },
          messageId: 'preferEnum',
        },
      ],
      output: 'node.type === DefinitionType.Parameter;',
    },
  ],
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
});
