import path from 'path';
import rule, { MessageId } from '../../src/rules/no-implicit-this-methods';
import { RuleTester } from '../RuleTester';
import { TestCaseError } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const ruleError = (
  line: number,
  column: number,
  messageId: MessageId,
): TestCaseError<MessageId> => ({ messageId, line, column });

ruleTester.run('no-implicit-this-methods', rule, {
  valid: [
    // Object properties without this
    `
const obj = {
  foo() { return 'foo'; },
  bar: function() { return 'bar'; },
}`,
    // Class methods without this
    `
class Test {
  foo() { return 'foo'; }
  bar = function() { return 'bar'; }
}`,
    // Object with explicit this annotations
    `
const obj = {
  v: 'val',
  foo(this: {v: string}) { return this.v },
  bar: function(this: {v: string}) { return this.v; },
}`,
    // Class with explicit this annotations
    `
class Test {
  v = 'val';
  foo(this: Test) { return this.v; }
}`,
    // Ignores constructors
    `
class Test {
  value: string;
  constructor() { this.value = "val"; }
}`,
  ],
  invalid: [
    // Object needing explicit this annotation
    {
      code: `
const obj = {
  v: 'val',
  foo() { return this.v },
  bar: function() { return this.v; },
}`,
      errors: [
        ruleError(4, 6, 'implicitThis'),
        ruleError(5, 8, 'implicitThis'),
      ],
    },
    // Class needing explicit this annotation
    {
      code: `
class Test {
  v = "val";
  foo() { return this.v }
}`,
      errors: [ruleError(4, 6, 'implicitThis')],
    },
  ],
});
