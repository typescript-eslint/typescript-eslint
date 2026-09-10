import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-string-starts-ends-with';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-string-starts-ends-with', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
function f(s: string[]) {
  s[0] === 'a';
}
    `,
    `
function f(s: string[] | null) {
  s?.[0] === 'a';
}
    `,
    `
function f(s: string[] | undefined) {
  s?.[0] === 'a';
}
    `,
    `
function f(s: string) {
  s[0] + 'a';
}
    `,
    `
function f(s: string) {
  s[1] === 'a';
}
    `,
    `
function f(s: string | undefined) {
  s?.[1] === 'a';
}
    `,
    `
function f(s: string | string[]) {
  s[0] === 'a';
}
    `,
    `
function f(s: any) {
  s[0] === 'a';
}
    `,
    `
function f<T>(s: T) {
  s[0] === 'a';
}
    `,
    `
function f(s: string[]) {
  s[s.length - 1] === 'a';
}
    `,
    `
function f(s: string[] | undefined) {
  s?.[s.length - 1] === 'a';
}
    `,
    `
function f(s: string) {
  s[s.length - 2] === 'a';
}
    `,
    `
function f(s: string | undefined) {
  s?.[s.length - 2] === 'a';
}
    `,
    `
function f(s: string[]) {
  s.charAt(0) === 'a';
}
    `,
    `
function f(s: string[] | undefined) {
  s?.charAt(0) === 'a';
}
    `,
    `
function f(s: string) {
  s.charAt(0) + 'a';
}
    `,
    `
function f(s: string) {
  s.charAt(1) === 'a';
}
    `,
    `
function f(s: string | undefined) {
  s?.charAt(1) === 'a';
}
    `,
    `
function f(s: string) {
  s.charAt() === 'a';
}
    `,
    `
function f(s: string[]) {
  s.charAt(s.length - 1) === 'a';
}
    `,
    `
function f(a: string, b: string, c: string) {
  (a + b).charAt((a + c).length - 1) === 'a';
}
    `,
    `
function f(a: string, b: string, c: string) {
  (a + b).charAt(c.length - 1) === 'a';
}
    `,
    `
function f(s: string[]) {
  s.indexOf(needle) === 0;
}
    `,
    `
function f(s: string | string[]) {
  s.indexOf(needle) === 0;
}
    `,
    `
function f(s: string) {
  s.indexOf(needle) === s.length - needle.length;
}
    `,
    `
function f(s: string[]) {
  s.lastIndexOf(needle) === s.length - needle.length;
}
    `,
    `
function f(s: string) {
  s.lastIndexOf(needle) === 0;
}
    `,
    `
function f(s: string) {
  s.match(/^foo/);
}
    `,
    `
function f(s: string) {
  s.match(/foo$/);
}
    `,
    `
function f(s: string) {
  s.match(/^foo/) + 1;
}
    `,
    `
function f(s: string) {
  s.match(/foo$/) + 1;
}
    `,
    `
function f(s: { match(x: any): boolean }) {
  s.match(/^foo/) !== null;
}
    `,
    `
function f(s: { match(x: any): boolean }) {
  s.match(/foo$/) !== null;
}
    `,
    `
function f(s: string) {
  s.match(/foo/) !== null;
}
    `,
    `
function f(s: string) {
  s.match(/^foo$/) !== null;
}
    `,
    `
function f(s: string) {
  s.match(/^foo./) !== null;
}
    `,
    `
function f(s: string) {
  s.match(/^foo|bar/) !== null;
}
    `,
    `
function f(s: string) {
  s.match(new RegExp('')) !== null;
}
    `,
    `
function f(s: string) {
  s.match(pattern) !== null; // cannot check '^'/'$'
}
    `,
    `
function f(s: string) {
  s.match(new RegExp('^/!{[', 'u')) !== null; // has syntax error
}
    `,
    `
function f(s: string) {
  s.match() !== null;
}
    `,
    `
function f(s: string) {
  s.match(777) !== null;
}
    `,
    `
function f(s: string[]) {
  s.slice(0, needle.length) === needle;
}
    `,
    `
function f(s: string[]) {
  s.slice(-needle.length) === needle;
}
    `,
    `
function f(s: string) {
  s.slice(1, 4) === 'bar';
}
    `,
    `
function f(s: string) {
  s.slice(-4, -1) === 'bar';
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1690
    `
function f(s: string) {
  s.slice(1) === 'bar';
}
    `,
    `
function f(s: string | null) {
  s?.slice(1) === 'bar';
}
    `,
    `
function f(s: string) {
  pattern.test(s);
}
    `,
    `
function f(s: string) {
  /^bar/.test();
}
    `,
    `
function f(x: { test(): void }, s: string) {
  x.test(s);
}
    `,
    `
function f(s: string) {
  s.slice(0, -4) === 'car';
}
    `,
    `
function f(x: string, s: string) {
  x.endsWith('foo') && x.slice(0, -4) === 'bar';
}
    `,
    `
function f(s: string) {
  s.slice(0, length) === needle; // the 'length' can be different to 'needle.length'
}
    `,
    `
function f(s: string) {
  s.slice(-length) === needle; // 'length' can be different
}
    `,
    `
function f(s: string) {
  s.slice(0, 3) === needle;
}
    `,
    {
      code: `
declare const s: string;
s[0] === 'a';
      `,
      options: [{ allowSingleElementEquality: 'always' }],
    },
    {
      code: `
declare const s: string;
s[s.length - 1] === 'a';
      `,
      options: [{ allowSingleElementEquality: 'always' }],
    },
    "/foo\\$/.test('string');",
    "/foo\\\\\\$/.test('string');",
    "/beforeAnchor$afterAnchor/.test('string');",
    "/beforeDollarSign\\$afterDollarSign/.test('string');",
    "/beforeAnchor\\\\$afterAnchor/.test('string');",
    '/[$]/.test(string);',
  ],
  invalid: [
    // String indexing.
    {
      code: `
function f(s: string) {
  s[0] === 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s?.[0] === 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s?.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s[0] !== 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s?.[0] !== 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s?.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s[0] == 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s[0] != 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s[0] === 'あ';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('あ');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s[0] === '👍'; // the length is 2.
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: null,
    },
    {
      code: `
function f(s: string, t: string) {
  s[0] === t; // the length of t is unknown.
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: null,
    },
    {
      code: `
function f(s: string) {
  s[s.length - 1] === 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('a');
}
      `,
    },
    {
      code: noFormat`
        function f(s: string) {
          (s)[0] === ("a")
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
        function f(s: string) {
          (s).startsWith("a")
        }
      `,
    },

    // String#charAt
    {
      code: `
function f(s: string) {
  s.charAt(0) === 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.charAt(0) !== 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.charAt(0) == 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.charAt(0) != 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith('a');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.charAt(0) === 'あ';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('あ');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.charAt(0) === '👍'; // the length is 2.
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: null,
    },
    {
      code: `
function f(s: string, t: string) {
  s.charAt(0) === t; // the length of t is unknown.
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: null,
    },
    {
      code: `
function f(s: string) {
  s.charAt(s.length - 1) === 'a';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('a');
}
      `,
    },
    {
      code: noFormat`
        function f(s: string) {
          (s).charAt(0) === "a";
        }
      `,
      errors: [
        {
          column: 11,
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
        function f(s: string) {
          (s).startsWith("a");
        }
      `,
    },

    // String#indexOf
    {
      code: `
function f(s: string) {
  s.indexOf(needle) === 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s?.indexOf(needle) === 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s?.startsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.indexOf(needle) !== 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.indexOf(needle) == 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.indexOf(needle) != 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith(needle);
}
      `,
    },

    // String#lastIndexOf
    {
      code: `
function f(s: string) {
  s.lastIndexOf('bar') === s.length - 3;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.lastIndexOf('bar') !== s.length - 3;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.lastIndexOf('bar') == s.length - 3;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.lastIndexOf('bar') != s.length - 3;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.lastIndexOf('bar') === s.length - 'bar'.length;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 51,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.lastIndexOf(needle) === s.length - needle.length;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith(needle);
}
      `,
    },

    // String#match
    {
      code: `
function f(s: string) {
  s.match(/^bar/) !== null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s?.match(/^bar/) !== null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s?.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/^bar/) != null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/bar$/) !== null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/bar$/) != null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/^bar/) === null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/^bar/) == null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/bar$/) === null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.endsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.match(/bar$/) == null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.endsWith("bar");
}
      `,
    },
    {
      code: `
const pattern = /^bar/;
function f(s: string) {
  s.match(pattern) != null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
const pattern = /^bar/;
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
const pattern = new RegExp('^bar');
function f(s: string) {
  s.match(pattern) != null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
const pattern = new RegExp('^bar');
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
const pattern = /^"quoted"/;
function f(s: string) {
  s.match(pattern) != null;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
const pattern = /^"quoted"/;
function f(s: string) {
  s.startsWith("\\"quoted\\"");
}
      `,
    },

    // String#slice
    {
      code: `
function f(s: string) {
  s.slice(0, 3) === 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s?.slice(0, 3) === 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s?.startsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(0, 3) !== 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(0, 3) == 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(0, 3) != 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.startsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(0, needle.length) === needle;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(0, needle.length) == needle; // hating implicit type conversion
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 38,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: null,
    },
    {
      code: `
function f(s: string) {
  s.slice(-3) === 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(-3) !== 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  !s.endsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(-needle.length) === needle;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 37,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.slice(s.length - needle.length) === needle;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith(needle);
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.substring(0, 3) === 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith('bar');
}
      `,
    },
    {
      code: `
function f(s: string) {
  s.substring(-3) === 'bar'; // the code is probably mistake.
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: null,
    },
    {
      code: `
function f(s: string) {
  s.substring(s.length - 3, s.length) === 'bar';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 48,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith('bar');
}
      `,
    },

    // RegExp#test
    {
      code: `
function f(s: string) {
  /^bar/.test(s);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  /^bar/?.test(s);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  s?.startsWith("bar");
}
      `,
    },
    {
      code: `
function f(s: string) {
  /bar$/.test(s);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'preferEndsWith',
        },
      ],
      output: `
function f(s: string) {
  s.endsWith("bar");
}
      `,
    },
    {
      code: `
const pattern = /^bar/;
function f(s: string) {
  pattern.test(s);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
const pattern = /^bar/;
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
const pattern = new RegExp('^bar');
function f(s: string) {
  pattern.test(s);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
const pattern = new RegExp('^bar');
function f(s: string) {
  s.startsWith("bar");
}
      `,
    },
    {
      code: `
const pattern = /^"quoted"/;
function f(s: string) {
  pattern.test(s);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
const pattern = /^"quoted"/;
function f(s: string) {
  s.startsWith("\\"quoted\\"");
}
      `,
    },
    {
      code: `
function f(s: string) {
  /^bar/.test(a + b);
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: string) {
  (a + b).startsWith("bar");
}
      `,
    },

    // Test for variation of string types.
    {
      code: `
function f(s: 'a' | 'b') {
  s.indexOf(needle) === 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f(s: 'a' | 'b') {
  s.startsWith(needle);
}
      `,
    },
    {
      code: `
function f<T extends 'a' | 'b'>(s: T) {
  s.indexOf(needle) === 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
function f<T extends 'a' | 'b'>(s: T) {
  s.startsWith(needle);
}
      `,
    },
    {
      code: `
type SafeString = string & { __HTML_ESCAPED__: void };
function f(s: SafeString) {
  s.indexOf(needle) === 0;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 26,
          endLine: 4,
          line: 4,
          messageId: 'preferStartsWith',
        },
      ],
      output: `
type SafeString = string & { __HTML_ESCAPED__: void };
function f(s: SafeString) {
  s.startsWith(needle);
}
      `,
    },
    {
      code: "/foo$/.test('string');",
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferEndsWith',
        },
      ],
      output: '\'string\'.endsWith("foo");',
    },
    {
      code: "/foo\\\\$/.test('string');",
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferEndsWith',
        },
      ],
      output: '\'string\'.endsWith("foo\\\\");',
    },
  ],
});
