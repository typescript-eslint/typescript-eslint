import { RuleTester } from '@typescript-eslint/rule-tester';

import { getESLintCoreRule } from '../../src/util/getESLintCoreRule';

const rule = getESLintCoreRule('no-restricted-globals');

const ruleTester = new RuleTester();

ruleTester.run('no-restricted-globals', rule, {
  invalid: [
    {
      code: `
function onClick() {
  console.log(event);
}

fdescribe('foo', function () {});
      `,
      errors: [
        {
          data: {
            name: 'event',
          },
          messageId: 'defaultMessage',
        },
      ],
      options: ['event'],
    },
    {
      code: `
confirm('TEST');
      `,
      errors: [
        {
          data: {
            name: 'confirm',
          },
          messageId: 'defaultMessage',
        },
      ],
      options: ['confirm'],
    },
    {
      code: `
var a = confirm('TEST')?.a;
      `,
      errors: [
        {
          data: {
            name: 'confirm',
          },
          messageId: 'defaultMessage',
        },
      ],
      options: ['confirm'],
    },
  ],
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
});
