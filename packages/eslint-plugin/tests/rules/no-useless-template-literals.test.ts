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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`1`;',
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    1    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`1`;',
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    'a'    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `'a';`,
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    "a"    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `"a";`,
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    'a' + 'b'    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `'a' + 'b';`,
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`true`;',
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    true    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`true`;',
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`null`;',
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    null    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`null`;',
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`undefined`;',
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${    undefined    }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`undefined`;',
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: "`a${'b'}`;",
            },
          ],
        },
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 10,
          endColumn: 13,
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: "`${'a'}b`;",
            },
          ],
        },
      ],
    },

    {
      code: noFormat`\`\${   'a'   }\${   'b'   }\`;`,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: noFormat`\`a\${   'b'   }\`;`,
            },
          ],
        },
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: noFormat`\`\${   'a'   }b\`;`,
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `
        declare const b: 'b';
        \`a\${b}c\`;
      `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`ab`;',
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`1 + 1 = ${2}`;',
            },
          ],
        },
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 17,
          endColumn: 18,
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: "`${'1 + 1 = '}2`;",
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: '`a${true}`;',
            },
          ],
        },
        {
          messageId: 'noUselessTemplateLiteral',
          line: 1,
          column: 10,
          endColumn: 14,
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: "`${'a'}true`;",
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `
        declare const string: 'a';
        string;
      `,
            },
          ],
        },
      ],
    },

    {
      code: noFormat`
        declare const string: 'a';
        \`\${   string   }\`;
      `,
      errors: [
        {
          messageId: 'noUselessTemplateLiteral',
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `
        declare const string: 'a';
        string;
      `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: "String(Symbol.for('test'));",
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `
        declare const intersection: string & { _brand: 'test-brand' };
        intersection;
      `,
            },
          ],
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
          suggestions: [
            {
              messageId: 'removeUselessTemplateLiteral',
              output: `
        function func<T extends string>(arg: T) {
          arg;
        }
      `,
            },
          ],
        },
      ],
    },
  ],
});
