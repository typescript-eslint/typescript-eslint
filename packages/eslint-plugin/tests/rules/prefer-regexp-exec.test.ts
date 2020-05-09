import rule from '../../src/rules/prefer-regexp-exec';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-regexp-exec', rule, {
  valid: [
    "'something'.match();",
    "'something'.match(/thing/g);",
    `
const text = 'something';
const search = /thing/g;
text.match(search);
    `,
    `
const match = (s: RegExp) => 'something';
match(/thing/);
    `,
    `
const a = { match: (s: RegExp) => 'something' };
a.match(/thing/);
    `,
    `
function f(s: string | string[]) {
  s.match(/e/);
}
    `,
  ],
  invalid: [
    {
      code: "'something'.match(/thing/);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
const text = 'something';
const search = /thing/;
text.match(search);
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 4,
          column: 1,
        },
      ],
    },
    {
      code: "'212'.match(2);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "'212'.match(+2);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "'oNaNo'.match(NaN);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code:
        "'Infinity contains -Infinity and +Infinity in JavaScript.'.match(Infinity);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code:
        "'Infinity contains -Infinity and +Infinity in JavaScript.'.match(+Infinity);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code:
        "'Infinity contains -Infinity and +Infinity in JavaScript.'.match(-Infinity);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "'void and null'.match(null);",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
function f(s: 'a' | 'b') {
  s.match('a');
}
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: `
type SafeString = string & { __HTML_ESCAPED__: void };
function f(s: SafeString) {
  s.match(/thing/);
}
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: `
function f<T extends 'a' | 'b'>(s: T) {
  s.match(/thing/);
}
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
