import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-base-to-string';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

const literalListBasic: string[] = [
  "''",
  "'text'",
  'true',
  'false',
  '1',
  '1n',
  '[]',
  '/regex/',
];

const literalListNeedParen: string[] = [
  "__dirname === 'foobar'",
  '{}.constructor()',
  '() => {}',
  'function() {}',
];

const literalList = [...literalListBasic, ...literalListNeedParen];

const literalListWrapped = [
  ...literalListBasic,
  ...literalListNeedParen.map(i => `(${i})`),
];

ruleTester.run('no-base-to-string', rule, {
  valid: [
    // template
    ...literalList.map(i => ({ code: `\`\${${i}}\`;`, ignoreTsErrors: true })),

    // operator + +=
    ...literalListWrapped
      .map(l =>
        literalListWrapped.map(r => ({
          code: `${l} + ${r};`,
          ignoreTsErrors: true,
        })),
      )
      .reduce((pre, cur) => [...pre, ...cur]),

    // toString()
    ...literalListWrapped.map(i => ({
      code: `${i === '1' ? `(${i})` : i}.toString();`,
      ignoreTsErrors: true,
    })),

    // variable toString() and template
    ...literalList.map(i => ({
      code: `
        let value = ${i};
        value.toString();
        let text = \`\${value}\`;
      `,
      ignoreTsErrors: true,
    })),

    `
function someFunction() {}
someFunction.toString();
let text = \`\${someFunction}\`;
    `,
    {
      code: 'unknownObject.toString();',
      ignoreTsErrors: [2304],
    },
    {
      code: 'unknownObject.someOtherMethod();',
      ignoreTsErrors: [2304],
    },
    `
      declare const unknownObject: any;
      unknownObject.toString();
    `,
    `
      declare const unknownObject: any;
      unknownObject.someOtherMethod();
    `,
    `
class CustomToString {
  toString() {
    return 'Hello, world!';
  }
}
'' + new CustomToString();
    `,
    {
      code: `
const literalWithToString = {
  toString: () => 'Hello, world!',
};
'' + literalToString;
      `,
      ignoreTsErrors: [2552],
    },
    `
const literalWithToString = {
  toString: () => 'Hello, world!',
};
'' + literalWithToString;
    `,
    `
const printer = (inVar: string | number | boolean) => {
  inVar.toString();
};
printer('');
printer(1);
printer(true);
    `,
    {
      code: 'let _ = {} * {};',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = {} / {};',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = ({} *= {});',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = ({} /= {});',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = ({} = {});',
    },
    {
      code: 'let _ = {} == {};',
      ignoreTsErrors: [2839],
    },
    {
      code: 'let _ = {} === {};',
      ignoreTsErrors: [2839],
    },
    {
      code: 'let _ = {} in {};',
      ignoreTsErrors: [2322],
    },
    {
      code: 'let _ = {} & {};',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = {} ^ {};',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = {} << {};',
      ignoreTsErrors: [2362, 2363],
    },
    {
      code: 'let _ = {} >> {};',
      ignoreTsErrors: [2362, 2363],
    },
    `
function tag(a: TemplateStringsArray, b: any) {}
tag\`\${{}}\`;
    `,
    `
      function tag(a: TemplateStringsArray, b: any) {}
      tag\`\${{}}\`;
    `,
    `
      interface Brand {}
      function test(v: string & Brand): string {
        return \`\${v}\`;
      }
    `,
    {
      code: "'' += new Error();",
      ignoreTsErrors: [2364],
    },
    {
      code: "'' += new URL('https://example.com');",
      ignoreTsErrors: [2364],
    },
    {
      code: "'' += new URLSearchParams();",
      ignoreTsErrors: [2364],
    },
  ],
  invalid: [
    {
      code: '`${{}})`;',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: '({}).toString();',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' + {};",
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' += {};",
      ignoreTsErrors: [2364],
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString + '';
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject + '';
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        interface A {}
        interface B {}
        function test(intersection: A & B): string {
          return \`\${intersection}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'intersection',
          },
          messageId: 'baseToString',
        },
      ],
    },
  ],
});
