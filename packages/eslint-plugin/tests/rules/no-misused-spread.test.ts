import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-misused-spread';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-misused-spread', rule, {
  valid: [
    `
const a = () => ({ value: 33 });
const b = {
  ...a(),
  name: 'name',
};
    `,
    `
const a = (x: number) => ({ value: x });
const b = {
  ...a(42),
  name: 'name',
};
    `,
    `
interface FuncWithProps {
  property?: string;
  (): number;
}
const funcWithProps: FuncWithProps = () => 1;
funcWithProps.property = 'foo';
const spreadFuncWithProps = { ...funcWithProps };
    `,
    `
type FuncWithProps = {
  property?: string;
  (): number;
};
const funcWithProps: FuncWithProps = () => 1;
funcWithProps.property = 'foo';
const spreadFuncWithProps = { ...funcWithProps };
    `,
    `
const a = { value: 33 };
const b = {
  ...a,
  name: 'name',
};
    `,
    `
const a = {};
const b = {
  ...a,
  name: 'name',
};
    `,
    `
const a = () => ({ value: 33 });
const b = ({ value: number }) => ({ value: value });
b({ ...a() });
    `,
    `
const a = [33];
const b = {
  ...a,
  name: 'name',
};
    `,
  ],
  invalid: [
    {
      code: `
const a = () => ({ value: 33 });
const b = {
  ...a,
  name: 'name',
};
      `,
      errors: [{ line: 4, column: 3, messageId: 'forbidden' }],
    },
    {
      code: `
const a = (x: number) => ({ value: x });
const b = {
  ...a,
  name: 'name',
};
      `,
      errors: [{ line: 4, column: 3, messageId: 'forbidden' }],
    },
    {
      code: `
const a = () => ({ value: 33 });
const b = ({ value: number }) => ({ value: value });
b({ ...a });
      `,
      errors: [{ line: 4, column: 5, messageId: 'forbidden' }],
    },
  ],
});
