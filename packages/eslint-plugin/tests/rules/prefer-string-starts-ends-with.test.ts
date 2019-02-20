import path from 'path';
import rule from '../../src/rules/prefer-string-starts-ends-with';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('prefer-string-starts-ends-with', rule, {
  valid: [
    `
      function f(s: string[]) {
        s[0] === "a"
      }
    `,
    `
      function f(s: string) {
        s[0] + "a"
      }
    `,
    `
      function f(s: string) {
        s[1] === "a"
      }
    `,
    `
      function f(s: string | string[]) {
        s[0] === "a"
      }
    `,
    `
      function f(s: any) {
        s[0] === "a"
      }
    `,
    `
      function f<T>(s: T) {
        s[0] === "a"
      }
    `,
    `
      function f(s: string[]) {
        s[s.length - 1] === "a"
      }
    `,
    `
      function f(s: string) {
        s[s.length - 2] === "a"
      }
    `,
    `
      function f(s: string[]) {
        s.charAt(0) === "a"
      }
    `,
    `
      function f(s: string) {
        s.charAt(0) + "a"
      }
    `,
    `
      function f(s: string) {
        s.charAt(1) === "a"
      }
    `,
    `
      function f(s: string) {
        s.charAt() === "a"
      }
    `,
    `
      function f(s: string[]) {
        s.charAt(s.length - 1) === "a"
      }
    `,
    `
      function f(a: string, b: string, c: string) {
        (a + b).charAt((a + c).length - 1) === "a"
      }
    `,
    `
      function f(a: string, b: string, c: string) {
        (a + b).charAt(c.length - 1) === "a"
      }
    `,
    `
      function f(s: string[]) {
        s.indexOf(needle) === 0
      }
    `,
    `
      function f(s: string | string[]) {
        s.indexOf(needle) === 0
      }
    `,
    `
      function f(s: string) {
        s.indexOf(needle) === s.length - needle.length
      }
    `,
    `
      function f(s: string[]) {
        s.lastIndexOf(needle) === s.length - needle.length
      }
    `,
    `
      function f(s: string) {
        s.lastIndexOf(needle) === 0
      }
    `,
    `
      function f(s: string) {
        s.match(/^foo/)
      }
    `,
    `
      function f(s: string) {
        s.match(/foo$/)
      }
    `,
    `
      function f(s: string) {
        s.match(/^foo/) + 1
      }
    `,
    `
      function f(s: string) {
        s.match(/foo$/) + 1
      }
    `,
    `
      function f(s: { match(x: any): boolean }) {
        s.match(/^foo/) !== null
      }
    `,
    `
      function f(s: { match(x: any): boolean }) {
        s.match(/foo$/) !== null
      }
    `,
    `
      function f(s: string) {
        s.match(/foo/) !== null
      }
    `,
    `
      function f(s: string) {
        s.match(/^foo$/) !== null
      }
    `,
    `
      function f(s: string) {
        s.match(/^foo./) !== null
      }
    `,
    `
      function f(s: string) {
        s.match(/^foo|bar/) !== null
      }
    `,
    `
      function f(s: string) {
        s.match(new RegExp("")) !== null
      }
    `,
    `
      function f(s: string) {
        s.match(pattern) !== null // cannot check '^'/'$'
      }
    `,
    `
      function f(s: string) {
        s.match(new RegExp("^/!{[", "u")) !== null // has syntax error
      }
    `,
    `
      function f(s: string) {
        s.match() !== null
      }
    `,
    `
      function f(s: string) {
        s.match(777) !== null
      }
    `,
    `
      function f(s: string[]) {
        s.slice(0, needle.length) === needle
      }
    `,
    `
      function f(s: string[]) {
        s.slice(-needle.length) === needle
      }
    `,
    `
      function f(s: string) {
        s.slice(1, 4) === "bar"
      }
    `,
    `
      function f(s: string) {
        s.slice(-4, -1) === "bar"
      }
    `,
    `
      function f(s: string) {
        pattern.test(s)
      }
    `,
    `
      function f(s: string) {
        /^bar/.test()
      }
    `,
    `
      function f(x: { test(): void }, s: string) {
        x.test(s)
      }
    `,
  ],
  invalid: [
    // String indexing.
    {
      code: `
        function f(s: string) {
          s[0] === "a"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s[0] !== "a"
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s[0] == "a"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s[0] != "a"
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s[0] === "あ"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("あ")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s[0] === "👍" // the length is 2.
        }
      `,
      output: null,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string, t: string) {
          s[0] === t // the length of t is unknown.
        }
      `,
      output: null,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s[s.length - 1] === "a"
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("a")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          (s)[0] === ("a")
        }
      `,
      output: `
        function f(s: string) {
          (s).startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },

    // String#charAt
    {
      code: `
        function f(s: string) {
          s.charAt(0) === "a"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.charAt(0) !== "a"
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.charAt(0) == "a"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.charAt(0) != "a"
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.charAt(0) === "あ"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("あ")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.charAt(0) === "👍" // the length is 2.
        }
      `,
      output: null,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string, t: string) {
          s.charAt(0) === t // the length of t is unknown.
        }
      `,
      output: null,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.charAt(s.length - 1) === "a"
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("a")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          (s).charAt(0) === "a"
        }
      `,
      output: `
        function f(s: string) {
          (s).startsWith("a")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },

    // String#indexOf
    {
      code: `
        function f(s: string) {
          s.indexOf(needle) === 0
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.indexOf(needle) !== 0
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.indexOf(needle) == 0
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.indexOf(needle) != 0
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },

    // String#lastIndexOf
    {
      code: `
        function f(s: string) {
          s.lastIndexOf("bar") === s.length - 3
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.lastIndexOf("bar") !== s.length - 3
        }
      `,
      output: `
        function f(s: string) {
          !s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.lastIndexOf("bar") == s.length - 3
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.lastIndexOf("bar") != s.length - 3
        }
      `,
      output: `
        function f(s: string) {
          !s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.lastIndexOf("bar") === s.length - "bar".length
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.lastIndexOf(needle) === s.length - needle.length
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },

    // String#match
    {
      code: `
        function f(s: string) {
          s.match(/^bar/) !== null
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/^bar/) != null
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/bar$/) !== null
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/bar$/) != null
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/^bar/) === null
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/^bar/) == null
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/bar$/) === null
        }
      `,
      output: `
        function f(s: string) {
          !s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.match(/bar$/) == null
        }
      `,
      output: `
        function f(s: string) {
          !s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        const pattern = /^bar/
        function f(s: string) {
          s.match(pattern) != null
        }
      `,
      output: `
        const pattern = /^bar/
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        const pattern = new RegExp("^bar")
        function f(s: string) {
          s.match(pattern) != null
        }
      `,
      output: `
        const pattern = new RegExp("^bar")
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        const pattern = /^"quoted"/
        function f(s: string) {
          s.match(pattern) != null
        }
      `,
      output: `
        const pattern = /^"quoted"/
        function f(s: string) {
          s.startsWith("\\"quoted\\"")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },

    // String#slice
    {
      code: `
        function f(s: string) {
          s.slice(0, 3) === "bar"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(0, 3) !== "bar"
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(0, 3) == "bar"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(0, 3) != "bar"
        }
      `,
      output: `
        function f(s: string) {
          !s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(0, needle.length) === needle
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(0, length) === needle // the 'length' can be different to 'needle.length'
        }
      `,
      output: null,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(0, needle.length) == needle // hating implicit type conversion
        }
      `,
      output: null,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(-3) === "bar"
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(-3) !== "bar"
        }
      `,
      output: `
        function f(s: string) {
          !s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(-needle.length) === needle
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(s.length - needle.length) === needle
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.slice(startIndex) === needle // 'startIndex' can be different
        }
      `,
      output: null,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.substring(0, 3) === "bar"
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.substring(-3) === "bar" // the code is probably mistake.
        }
      `,
      output: null,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        function f(s: string) {
          s.substring(s.length - 3, s.length) === "bar"
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },

    // RegExp#test
    {
      code: `
        function f(s: string) {
          /^bar/.test(s)
        }
      `,
      output: `
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          /bar$/.test(s)
        }
      `,
      output: `
        function f(s: string) {
          s.endsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferEndsWith' }],
    },
    {
      code: `
        const pattern = /^bar/
        function f(s: string) {
          pattern.test(s)
        }
      `,
      output: `
        const pattern = /^bar/
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        const pattern = new RegExp("^bar")
        function f(s: string) {
          pattern.test(s)
        }
      `,
      output: `
        const pattern = new RegExp("^bar")
        function f(s: string) {
          s.startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        const pattern = /^"quoted"/
        function f(s: string) {
          pattern.test(s)
        }
      `,
      output: `
        const pattern = /^"quoted"/
        function f(s: string) {
          s.startsWith("\\"quoted\\"")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f(s: string) {
          /^bar/.test(a + b)
        }
      `,
      output: `
        function f(s: string) {
          (a + b).startsWith("bar")
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },

    // Test for variation of string types.
    {
      code: `
        function f(s: "a" | "b") {
          s.indexOf(needle) === 0
        }
      `,
      output: `
        function f(s: "a" | "b") {
          s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        function f<T extends "a" | "b">(s: T) {
          s.indexOf(needle) === 0
        }
      `,
      output: `
        function f<T extends "a" | "b">(s: T) {
          s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
    {
      code: `
        type SafeString = string & {__HTML_ESCAPED__: void}
        function f(s: SafeString) {
          s.indexOf(needle) === 0
        }
      `,
      output: `
        type SafeString = string & {__HTML_ESCAPED__: void}
        function f(s: SafeString) {
          s.startsWith(needle)
        }
      `,
      errors: [{ messageId: 'preferStartsWith' }],
    },
  ],
});
