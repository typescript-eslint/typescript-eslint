import rule from '../../src/rules/no-base-to-string';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-base-to-string', rule, {
  valid: [
    `\`\${""}\``,
    `\`\${true}\``,
    `\`\${[]}\``,
    `\`\${function () {}}\``,
    `"" + ""`,
    `"" + true`,
    `"" + []`,
    `true + true`,
    `true + ""`,
    `true + []`,
    `[] + []`,
    `[] + true`,
    `[] + ""`,
    `({}).constructor()`,
    `"text".toString()`,
    `false.toString()`,
    `let value = 1;
        value.toString()`,
    `let value = 1n;
        value.toString()`,
    `function someFunction() { }
        someFunction.toString();`,
    'unknownObject.toString()',
    'unknownObject.someOtherMethod()',
    '(() => {}).toString();',
    `class CustomToString { toString() { return "Hello, world!"; } }
      "" + (new CustomToString());`,
    `const literalWithToString = {
      toString: () => "Hello, world!",
    };
    "" + literalToString;`,
    `let _ = {} * {}`,
    `let _ = {} / {}`,
    `let _ = {} *= {}`,
    `let _ = {} /= {}`,
    `let _ = {} = {}`,
    `let _ = {} == {}`,
    `let _ = {} === {}`,
    `let _ = {} in {}`,
    `let _ = {} & {}`,
    `let _ = {} ^ {}`,
    `let _ = {} << {}`,
    `let _ = {} >> {}`,
    {
      code: `
        function tag() {}
        tag\`\${{}}\`;
      `,
      options: [
        {
          ignoreTaggedTemplateExpressions: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `\`\${{}})\``,
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
        function tag() {}
        tag\`\${{}}\`;
      `,
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
      code: `({}).toString()`,
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
      code: `"" + {}`,
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
      code: `"" += {}`,
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
        let someObjectOrString = Math.random() ? { a: true } : "text";
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
        let someObjectOrString = Math.random() ? { a: true } : "text";
        someObjectOrString + "";
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
        someObjectOrObject + "";
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
  ],
});
