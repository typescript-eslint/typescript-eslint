import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-regexp-exec';
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

ruleTester.run('prefer-regexp-exec', rule, {
  invalid: [
    {
      code: "'something'.match(/thing/);",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'regExpExecOverStringMatch',
        },
      ],
      output: "/thing/.exec('something');",
    },
    {
      code: "'something'.match('^[a-z]+thing/?$');",
      errors: [
        {
          column: 13,
          line: 1,
          messageId: 'regExpExecOverStringMatch',
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
          column: 6,
          line: 4,
          messageId: 'regExpExecOverStringMatch',
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
          column: 6,
          line: 4,
          messageId: 'regExpExecOverStringMatch',
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
          column: 5,
          line: 3,
          messageId: 'regExpExecOverStringMatch',
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
          column: 5,
          line: 4,
          messageId: 'regExpExecOverStringMatch',
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
          column: 5,
          line: 3,
          messageId: 'regExpExecOverStringMatch',
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
          column: 6,
          line: 4,
          messageId: 'regExpExecOverStringMatch',
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
          column: 11,
          line: 3,
          messageId: 'regExpExecOverStringMatch',
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
          column: 8,
          line: 3,
          messageId: 'regExpExecOverStringMatch',
        },
        {
          column: 8,
          line: 4,
          messageId: 'regExpExecOverStringMatch',
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
    {
      code: `
const text = 'something';
declare const search: RegExp;
text.match(search);
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/8614
    {
      code: `
const text = 'something';
declare const obj: { search: RegExp };
text.match(obj.search);
      `,
    },
    {
      code: `
const text = 'something';
declare function returnsRegexp(): RegExp;
text.match(returnsRegexp());
      `,
    },
  ],
});
