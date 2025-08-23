/* eslint-disable perfectionist/sort-objects */
import type { TSESLint } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import path from 'node:path';

import { RuleTester } from '../src/RuleTester';

const rule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    docs: {
      description: 'some description',
    },
    messages: {
      foo: 'It works',
      createError: 'Create error',
    },
    schema: [],
    type: 'problem',
    hasSuggestions: true,
  },
  defaultOptions: [],
  create: context => ({
    Program(node): void {
      context.report({
        node,
        messageId: 'foo',
        suggest:
          node.body.length === 1 &&
          node.body[0].type === AST_NODE_TYPES.EmptyStatement
            ? [
                {
                  messageId: 'createError',
                  fix(fixer): TSESLint.RuleFix {
                    return fixer.replaceText(node, '//');
                  },
                },
              ]
            : [],
      });
    },
  }),
});

describe('rule tester filename', () => {
  new RuleTester().run('without tsconfigRootDir', rule, {
    invalid: [
      {
        name: 'absolute path',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '/an-absolute-path/foo.js',
      },
      {
        name: 'relative path above project',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '../foo.js',
      },
      {
        name: 'non-normalized relative path starting with ./',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: './../../escaped/cwd/file.ts',
      },
      {
        name: 'non-normalized relative path ./../',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: './../foo.js',
      },
      {
        name: 'non-normalized relative path with multiple ./',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '././../foo.js',
      },
    ],
    valid: [],
  });

  new RuleTester({
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: path.resolve('/some/path/that/totally/exists/'),
      },
    },
  }).run('with tsconfigRootDir', rule, {
    invalid: [
      {
        name: 'absolute path',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '/an-absolute-path/foo.js',
      },
      {
        name: 'relative path above project',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '../foo.js',
      },
      {
        name: 'non-normalized relative path starting with ./',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: './../../escaped/cwd/file.ts',
      },
      {
        name: 'non-normalized relative path ./../',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: './../foo.js',
      },
      {
        name: 'non-normalized relative path with multiple ./',
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '././../foo.js',
      },
    ],
    valid: [],
  });
});

describe('rule tester suggestion syntax error checks', () => {
  new RuleTester().run('verifies suggestion with absolute path', rule, {
    invalid: [
      {
        code: ';',
        errors: [
          {
            messageId: 'foo',
            suggestions: [{ messageId: 'createError', output: '//' }],
          },
        ],
        filename: '/an-absolute-path/foo.js',
      },
    ],
    valid: [],
  });

  new RuleTester().run('verifies suggestion with relative path', rule, {
    invalid: [
      {
        code: ';',
        errors: [
          {
            messageId: 'foo',
            suggestions: [{ messageId: 'createError', output: '//' }],
          },
        ],
        filename: '../foo.js',
      },
    ],
    valid: [],
  });

  new RuleTester().run('verifies suggestion with no path', rule, {
    invalid: [
      {
        code: ';',
        errors: [
          {
            messageId: 'foo',
            suggestions: [{ messageId: 'createError', output: '//' }],
          },
        ],
      },
    ],
    valid: [],
  });
});
