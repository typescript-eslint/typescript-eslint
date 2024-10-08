import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-dynamic-delete';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('no-dynamic-delete', rule, {
  valid: [
    `
const container: { [i: string]: 0 } = {};
delete container.aaa;
    `,
    `
const container: { [i: string]: 0 } = {};
delete container.delete;
    `,
    `
const container: { [i: string]: 0 } = {};
delete container[7];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container[-7];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['-Infinity'];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['+Infinity'];
    `,
    `
const value = 1;
delete value;
    `,
    `
const value = 1;
delete -value;
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['aaa'];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['delete'];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['NaN'];
    `,
  ],
  invalid: [
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container['aa' + 'b'];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[+7];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[-Infinity];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[+Infinity];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[NaN];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
const name = 'name';
delete container[name];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
const getName = () => 'aaa';
delete container[getName()];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
const name = { foo: { bar: 'bar' } };
delete container[name.foo.bar];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[+'Infinity'];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[typeof 1];
      `,
      errors: [{ messageId: 'dynamicDelete' }],
      output: null,
    },
  ],
});
