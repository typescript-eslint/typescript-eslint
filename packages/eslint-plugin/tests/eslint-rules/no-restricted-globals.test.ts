import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';
import { RuleTester } from '../RuleTester';

const rule = getESLintCoreRule('no-restricted-globals');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-restricted-globals', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/487
    {
      code: `
export default class Test {
  private status: string;
  getStatus() {
    return this.status;
  }
}
      `,
      options: ['status'],
    },
    {
      code: `
type Handler = (event: string) => any;
      `,
      options: ['event'],
    },
    {
      code: `
        const a = foo?.bar?.name;
      `,
    },
    {
      code: `
        const a = foo?.bar?.name ?? 'foobar';
      `,
    },
    {
      code: `
        const a = foo()?.bar;
      `,
    },
    {
      code: `
        const a = foo()?.bar ?? true;
      `,
    },
  ],
  invalid: [
    {
      code: `
function onClick() {
  console.log(event);
}

fdescribe('foo', function () {});
      `,
      options: ['event'],
      errors: [
        {
          messageId: 'defaultMessage',
          data: {
            name: 'event',
          },
        },
      ],
    },
    {
      code: `
confirm('TEST');
      `,
      options: ['confirm'],
      errors: [
        {
          messageId: 'defaultMessage',
          data: {
            name: 'confirm',
          },
        },
      ],
    },
    {
      code: `
var a = confirm('TEST')?.a;
      `,
      options: ['confirm'],
      errors: [
        {
          messageId: 'defaultMessage',
          data: {
            name: 'confirm',
          },
        },
      ],
    },
  ],
});
