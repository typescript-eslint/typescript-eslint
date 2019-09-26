import path from 'path';
import rule, { MessageId } from '../../src/rules/no-forgotten-func-call';
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
): TestCaseError<MessageId> => ({
  messageId,
  line,
  column,
});

ruleTester.run('no-forgotten-func-call', rule, {
  valid: [
    `
const a = () => false
if (a()) {}
function b() { return false }
if (b()) {}
let c = () => "c"
c = () => "d"
class D {
  d() { return true }
  e = () => { return true }
  get f() { return true }
  g() {
    if (this.d()) {}
    if (this.e()) {}
    if (this.f) {}
  }
}
const d = new D()
if (d) {}
if (d.d()) {}
if (d.d !== undefined) {}
if (d.e()) {}
if (d.f) {}
const h = {}
h.i = () => {}
declare const j: () => {} | undefined
if (j && j()) {}
  `,
  ],
  invalid: [
    {
      code: `
const a = () => false
if (a) {}
function b() { return false }
if (b) {}
class D {
  d() { return true }
  e = () => { return true }
  g() {
    if (this.d) {}
    if (this.e) {}
  }
}
const d = new D()
if (d.d) {}
if (d.e) {}
`,
      errors: [
        ruleError(3, 5, 'callExpected'),
        ruleError(5, 5, 'callExpected'),
        ruleError(10, 9, 'callExpected'),
        ruleError(11, 9, 'callExpected'),
        ruleError(15, 5, 'callExpected'),
        ruleError(16, 5, 'callExpected'),
      ],
    },
    {
      code: `
const f = {}
f.g = () => {}
`,
      options: [{ allowAssignmentToAny: false }],
      errors: [ruleError(3, 7, 'callExpected')],
    },
    {
      code: `
declare const f: () => {} | undefined
if (f && f()) {}
`,
      options: [{ allowCheckAndCallExpressions: false }],
      errors: [ruleError(3, 5, 'callExpected')],
    },
  ],
});
