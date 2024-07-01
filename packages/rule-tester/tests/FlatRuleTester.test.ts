/// <reference types="lodash" />
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { join } from 'node:path';

import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

import { FlatRuleTester } from '../src/FlatRuleTester';

const tester = new FlatRuleTester({
  baseOptions: {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: {},
        ecmaVersion: 2024,
      },
    },
  },
  extensions: {
    ts: {},
  },
  fixtureRootDir: join(__dirname, './fixtures'),
});

const myRule = tester.rule('my-rule', {
  meta: {
    messages: {
      disallowedName: 'disallowed',
      suggest: 'suggest',
    },
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    ],
    type: 'problem',
    hasSuggestions: true,
  },
  create(ctx) {
    return {
      FunctionDeclaration(node) {
        if (
          ctx.options.length === 1 &&
          node.id != null &&
          ctx.options[0].includes(node.id.name)
        ) {
          return;
        }

        return ctx.report({
          node,
          messageId: 'disallowedName',
          suggest: [
            {
              fix(fixer) {
                return [fixer.remove(node)];
              },
              messageId: 'suggest',
            },
          ],
        });
      },
    };
  },
  defaultOptions: [['string']] as [string[]] | [],
});

const hello = myRule.configuration(['hello']);
hello.valid('Hello function', 'function hello() {}');
hello.invalid('Not a hello function', 'function nothello() {}', null, [
  {
    messageId: 'disallowedName',
    suggestions: [
      {
        messageId: 'suggest',
      },
    ],
  },
]);

const again = myRule.configuration(['again']);
again.valid('Again function', 'function again() {}');
again.invalid('Not an again function', 'function notagain() {}', null, [
  {
    messageId: 'disallowedName',
    suggestions: [
      {
        messageId: 'suggest',
      },
    ],
  },
]);

myRule.fromObject([], {
  valid: [],
  invalid: [
    {
      code: `function test() {}`,
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
        },
      ],
    },
  ],
});

tester.test();
