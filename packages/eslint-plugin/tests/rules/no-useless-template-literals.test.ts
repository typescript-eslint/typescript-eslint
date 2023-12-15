import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-useless-template-literals';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('no-useless-template-literals', rule, {
  valid: [
    "const string = 'a';",
    'const string = `a`;',

    `
      declare const string: 'a';
      \`\${string}b\`;
    `,

    `
      declare const number: 1;
      \`\${number}b\`;
    `,

    `
      declare const boolean: true;
      \`\${boolean}b\`;
    `,

    `
      declare const nullish: null;
      \`\${nullish}-undefined\`;
    `,

    `
      declare const undefinedish: undefined;
      \`\${undefinedish}\`;
    `,

    `
      declare const left: 'a';
      declare const right: 'b';
      \`\${left}\${right}\`;
    `,

    `
      declare const left: 'a';
      declare const right: 'c';
      \`\${left}b\${right}\`;
    `,

    `
      declare const left: 'a';
      declare const center: 'b';
      declare const right: 'c';
      \`\${left}\${center}\${right}\`;
    `,

    '`1 + 1 = ${1 + 1}`;',

    '`true && false = ${true && false}`;',

    "tag`${'a'}${'b'}`;",

    '`${function () {}}`;',

    '`${() => {}}`;',

    '`${(...args: any[]) => args}`;',

    `
      declare const number: 1;
      \`\${number}\`;
    `,

    `
      declare const boolean: true;
      \`\${boolean}\`;
    `,

    `
      declare const nullish: null;
      \`\${nullish}\`;
    `,

    `
      declare const union: string | number;
      \`\${union}\`;
    `,

    `
      declare const unknown: unknown;
      \`\${unknown}\`;
    `,

    `
      declare const never: never;
      \`\${never}\`;
    `,

    `
      declare const any: any;
      \`\${any}\`;
    `,

    `
      function func<T extends number>(arg: T) {
        \`\${arg}\`;
      }
    `,

    `
      \`with

      new line\`;
    `,

    `
      declare const a: 'a';

      \`\${a} with

      new line\`;
    `,

    noFormat`
      \`with windows \r new line\`;
    `,
  ],

  invalid: [
    {
      code: '`${1}`;',
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 5,
        },
      ],
    },
    {
      code: '`${1n}`;',
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 6,
        },
      ],
    },
    {
      code: '`${true}`;',
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 8,
        },
      ],
    },
    {
      code: '`${null}`;',
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 8,
        },
      ],
    },
    {
      code: '`${undefined}`;',
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 13,
        },
      ],
    },
    {
      code: "`${'a'}${'b'}`;",
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 7,
        },
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 10,
          endColumn: 13,
        },
      ],
    },

    {
      code: `
        declare const b: 'b';
        \`a\${b}\${'c'}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 17,
          endColumn: 20,
        },
      ],
    },

    {
      code: "`a${'b'}`;",
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 5,
          endColumn: 8,
        },
      ],
    },

    {
      code: "`${'1 + 1 = '}${2}`;",
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 14,
        },
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 17,
          endColumn: 18,
        },
      ],
    },

    {
      code: "`${'a'}${true}`;",
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 7,
        },
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 10,
          endColumn: 14,
        },
      ],
    },

    {
      code: `
        declare const string: 'a';
        \`\${string}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 12,
          endColumn: 18,
        },
      ],
    },

    {
      code: "`${String(Symbol.for('test'))}`;",
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 4,
          endColumn: 30,
        },
      ],
    },

    {
      code: `
        declare const intersection: string & { _brand: 'test-brand' };
        \`\${intersection}\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 12,
          endColumn: 24,
        },
      ],
    },

    {
      code: `
        function func<T extends string>(arg: T) {
          \`\${arg}\`;
        }
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          line: 3,
          column: 14,
          endColumn: 17,
        },
      ],
    },
  ],
});
