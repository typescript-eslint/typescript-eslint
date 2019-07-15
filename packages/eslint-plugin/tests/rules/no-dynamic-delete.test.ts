import path from 'path';
import rule from '../../src/rules/no-dynamic-delete';
import { RuleTester } from '../RuleTester';

const rootDir = path.join(process.cwd(), 'tests/fixtures');
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-dynamic-delete', rule, {
  valid: [
    `const container: { [i: string]: 0 } = {};
      delete container.aaa;`,
    `const container: { [i: string]: 0 } = {};
      delete container.delete;`,
    `const container: { [i: string]: 0 } = {};
      delete container[7];`,
    `const container: { [i: string]: 0 } = {};
      delete container[-7];`,
    `const container: { [i: string]: 0 } = {};
      delete container[+7];`,
    `const container: { [i: string]: 0 } = {};
      delete container['-Infinity'];`,
    `const container: { [i: string]: 0 } = {};
      delete container['+Infinity'];`,
    `const value = 1;
      delete value;`,
    `const value = 1;
      delete -value;`,
  ],
  invalid: [
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container['aaa'];`,
      errors: [{ messageId: 'dynamicDelete' }],
      output: `const container: { [i: string]: 0 } = {};
        delete container.aaa;`,
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container['aa' + 'b'];`,
      errors: [{ messageId: 'dynamicDelete' }],
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container['delete'];`,
      errors: [{ messageId: 'dynamicDelete' }],
      output: `const container: { [i: string]: 0 } = {};
        delete container.delete;`,
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container[-Infinity];`,
      errors: [{ messageId: 'dynamicDelete' }],
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container[+Infinity];`,
      errors: [{ messageId: 'dynamicDelete' }],
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container[NaN];`,
      errors: [{ messageId: 'dynamicDelete' }],
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        delete container['NaN'];`,
      errors: [{ messageId: 'dynamicDelete' }],
      output: `const container: { [i: string]: 0 } = {};
        delete container.NaN;`,
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        const name = 'name';
        delete container[name];`,
      errors: [{ messageId: 'dynamicDelete' }],
    },
    {
      code: `const container: { [i: string]: 0 } = {};
        const getName = () => 'aaa';
        delete container[getName()];`,
      errors: [{ messageId: 'dynamicDelete' }],
    },
  ],
});
