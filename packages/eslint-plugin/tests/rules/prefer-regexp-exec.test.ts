import rule from '../../src/rules/prefer-regexp-exec';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

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
    "(Math.random() > 0.5 ? 'abc' : 123).match(2);",
    "'212'.match(2);",
    "'212'.match(+2);",
    "'oNaNo'.match(NaN);",
    "'Infinity contains -Infinity and +Infinity in JavaScript.'.match(Infinity);",
    "'Infinity contains -Infinity and +Infinity in JavaScript.'.match(+Infinity);",
    "'Infinity contains -Infinity and +Infinity in JavaScript.'.match(-Infinity);",
    "'void and null'.match(null);",
    `
const matchers = ['package-lock.json', /regexp/];
const file = '';
matchers.some(matcher => !!file.match(matcher));
    `,
    `
const matchers = [/regexp/, 'package-lock.json'];
const file = '';
matchers.some(matcher => !!file.match(matcher));
    `,
    `
const matchers = [{ match: (s: RegExp) => false }];
const file = '';
matchers.some(matcher => !!file.match(matcher));
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/3477
    `
function test(pattern: string) {
  'hello hello'.match(RegExp(pattern, 'g'))?.reduce(() => []);
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/3477
    `
function test(pattern: string) {
  'hello hello'.match(new RegExp(pattern, 'gi'))?.reduce(() => []);
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/3477
    `
const matchCount = (str: string, re: RegExp) => {
  return (str.match(re) || []).length;
};
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/6928
    `
function test(str: string) {
  str.match('[a-z');
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
          column: 13,
        },
      ],
      output: "/thing/.exec('something');",
    },
    {
      code: "'something'.match('^[a-z]+thing/?$');",
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 1,
          column: 13,
        },
      ],
      output: "/^[a-z]+thing\\/?$/.exec('something');",
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
          column: 6,
        },
      ],
      output: `
const text = 'something';
const search = /thing/;
search.exec(text);
      `,
    },
    {
      code: `
const text = 'something';
const search = 'thing';
text.match(search);
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 4,
          column: 6,
        },
      ],
      output: `
const text = 'something';
const search = 'thing';
RegExp(search).exec(text);
      `,
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
          column: 5,
        },
      ],
      output: `
function f(s: 'a' | 'b') {
  /a/.exec(s);
}
      `,
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
          column: 5,
        },
      ],
      output: `
type SafeString = string & { __HTML_ESCAPED__: void };
function f(s: SafeString) {
  /thing/.exec(s);
}
      `,
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
          column: 5,
        },
      ],
      output: `
function f<T extends 'a' | 'b'>(s: T) {
  /thing/.exec(s);
}
      `,
    },
    {
      code: `
const text = 'something';
const search = new RegExp('test', '');
text.match(search);
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 4,
          column: 6,
        },
      ],
      output: `
const text = 'something';
const search = new RegExp('test', '');
search.exec(text);
      `,
    },
    {
      code: `
function test(pattern: string) {
  'check'.match(new RegExp(pattern, undefined));
}
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 3,
          column: 11,
        },
      ],
      output: `
function test(pattern: string) {
  new RegExp(pattern, undefined).exec('check');
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3941
      code: `
function temp(text: string): void {
  text.match(new RegExp(\`\${'hello'}\`));
  text.match(new RegExp(\`\${'hello'.toString()}\`));
}
      `,
      errors: [
        {
          messageId: 'regExpExecOverStringMatch',
          line: 3,
          column: 8,
        },
        {
          messageId: 'regExpExecOverStringMatch',
          line: 4,
          column: 8,
        },
      ],
      output: `
function temp(text: string): void {
  new RegExp(\`\${'hello'}\`).exec(text);
  new RegExp(\`\${'hello'.toString()}\`).exec(text);
}
      `,
    },
  ],
});
