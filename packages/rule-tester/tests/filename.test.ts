/* eslint-disable perfectionist/sort-objects */
import { RuleTester } from '@typescript-eslint/rule-tester';
import { ESLintUtils } from '@typescript-eslint/utils';

const ruleTester = new RuleTester();

const rule = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    docs: {
      description: 'some description',
    },
    messages: {
      foo: 'It works',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: context => ({
    Program(node): void {
      context.report({ node, messageId: 'foo' });
    },
  }),
});

describe('rule tester filename', () => {
  ruleTester.run('absolute path', rule, {
    invalid: [
      {
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '/an-absolute-path/foo.js',
      },
    ],
    valid: [],
  });

  ruleTester.run('relative path', rule, {
    invalid: [
      {
        code: '_',
        errors: [{ messageId: 'foo' }],
        filename: '../foo.js',
      },
    ],
    valid: [],
  });
});
