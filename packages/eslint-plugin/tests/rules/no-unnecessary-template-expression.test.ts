import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-template-expression';
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

const invalidCases: readonly InvalidTestCase<
  'noUnnecessaryTemplateExpression',
  []
>[] = [
  {
    code: '`${1}`;',
    errors: [
      {
        column: 4,
        endColumn: 5,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`1`;',
  },
  {
    code: '`${1n}`;',
    errors: [
      {
        column: 4,
        endColumn: 6,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`1`;',
  },
  {
    code: '`${0o25}`;',
    errors: [
      {
        column: 4,
        endColumn: 8,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`21`;',
  },
  {
    code: '`${0b1010} ${0b1111}`;',
    errors: [
      {
        column: 4,
        endColumn: 10,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 14,
        endColumn: 20,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`10 15`;',
  },
  {
    code: '`${0x25}`;',
    errors: [
      {
        column: 4,
        endColumn: 8,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`37`;',
  },
  {
    code: '`${/a/}`;',
    errors: [
      {
        column: 4,
        endColumn: 7,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`/a/`;',
  },
  {
    code: '`${/a/gim}`;',
    errors: [
      {
        column: 4,
        endColumn: 10,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`/a/gim`;',
  },

  {
    code: noFormat`\`\${    1    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`1`;',
  },

  {
    code: noFormat`\`\${    'a'    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `'a';`,
  },

  {
    code: noFormat`\`\${    "a"    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `"a";`,
  },

  {
    code: noFormat`\`\${    'a' + 'b'    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `'a' + 'b';`,
  },

  {
    code: '`${true}`;',
    errors: [
      {
        column: 4,
        endColumn: 8,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`true`;',
  },

  {
    code: noFormat`\`\${    true    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`true`;',
  },

  {
    code: '`${null}`;',
    errors: [
      {
        column: 4,
        endColumn: 8,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`null`;',
  },

  {
    code: noFormat`\`\${    null    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`null`;',
  },

  {
    code: '`${undefined}`;',
    errors: [
      {
        column: 4,
        endColumn: 13,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`undefined`;',
  },

  {
    code: noFormat`\`\${    undefined    }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`undefined`;',
  },

  {
    code: '`${Infinity}`;',
    errors: [
      {
        column: 4,
        endColumn: 12,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`Infinity`;',
  },

  {
    code: '`${NaN}`;',
    errors: [
      {
        column: 4,
        endColumn: 7,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`NaN`;',
  },

  {
    code: "`${'a'} ${'b'}`;",
    errors: [
      {
        column: 4,
        endColumn: 7,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 11,
        endColumn: 14,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`a b`;',
  },

  {
    code: noFormat`\`\${   'a'   } \${   'b'   }\`;`,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`a b`;',
  },

  {
    code: "`use${'less'}`;",
    errors: [
      {
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`useless`;',
  },

  {
    code: '`use${`less`}`;',
    errors: [
      {
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`useless`;',
  },
  {
    code: noFormat`
\`u\${
  // hopefully this comment is not needed.
  'se'

}\${
  \`le\${  \`ss\`  }\`
}\`;
      `,
    errors: [
      {
        line: 4,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 3,
        endLine: 7,
        line: 7,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 10,
        endLine: 7,
        line: 7,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: [
      `
\`use\${
  \`less\`
}\`;
      `,
      `
\`useless\`;
      `,
    ],
  },
  {
    code: noFormat`
\`use\${
  \`less\`
}\`;
      `,
    errors: [
      {
        column: 3,
        endColumn: 9,
        line: 3,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `
\`useless\`;
      `,
  },

  {
    code: "`${'1 + 1 ='} ${2}`;",
    errors: [
      {
        column: 4,
        endColumn: 13,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 17,
        endColumn: 18,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`1 + 1 = 2`;',
  },

  {
    code: "`${'a'} ${true}`;",
    errors: [
      {
        column: 4,
        endColumn: 7,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 11,
        endColumn: 15,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`a true`;',
  },

  {
    code: "`${String(Symbol.for('test'))}`;",
    errors: [
      {
        column: 4,
        endColumn: 30,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: "String(Symbol.for('test'));",
  },

  {
    code: "`${'`'}`;",
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: "'`';",
  },

  {
    code: "`back${'`'}tick`;",
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`back\\`tick`;',
  },

  {
    code: "`dollar${'${`this is test`}'}sign`;",
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`dollar\\${\\`this is test\\`}sign`;',
  },

  {
    code: '`complex${\'`${"`${test}`"}`\'}case`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`complex\\`\\${"\\`\\${test}\\`"}\\`case`;',
  },

  {
    code: "`some ${'\\\\${test}'} string`;",
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some \\\\\\${test} string`;',
  },

  {
    code: "`some ${'\\\\`'} string`;",
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some \\\\\\` string`;',
  },

  {
    code: '`some ${/`/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\`/ string`;',
  },
  {
    code: '`some ${/\\`/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\\\\\`/ string`;',
  },
  {
    code: '`some ${/\\\\`/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\\\\\\\\\`/ string`;',
  },
  {
    code: '`some ${/\\\\\\`/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\\\\\\\\\\\\\`/ string`;',
  },
  {
    code: '`some ${/${}/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\${}/ string`;',
  },
  {
    code: '`some ${/$ {}/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /$ {}/ string`;',
  },
  {
    code: '`some ${/\\\\/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\\\\\\\/ string`;',
  },
  {
    code: '`some ${/\\\\\\b/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\\\\\\\\\\\b/ string`;',
  },
  {
    code: '`some ${/\\\\\\\\/} string`;',
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: '`some /\\\\\\\\\\\\\\\\/ string`;',
  },
  {
    code: "` ${''} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '`  `;',
  },
  {
    code: noFormat`\` \${""} \`;`,
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '`  `;',
  },
  {
    code: '` ${``} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '`  `;',
  },
  {
    code: noFormat`\` \${'\\\`'} \`;`,
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\` `;',
  },
  {
    code: "` ${'\\\\`'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\\\` `;',
  },
  {
    code: "` ${'$'}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${} `;',
  },
  {
    code: noFormat`\` \${'\\$'}{} \`;`,
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${} `;',
  },
  {
    code: "` ${'\\\\$'}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\\\${} `;',
  },
  {
    code: "` ${'\\\\$ '}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\$ {} `;',
  },
  {
    code: noFormat`\` \${'\\\\\\$'}{} \`;`,
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\\\${} `;',
  },
  {
    code: "` \\\\${'\\\\$'}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\\\\\\\${} `;',
  },
  {
    code: "` $${'{$'}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${\\${} `;',
  },
  {
    code: "` $${'${$'}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` $\\${\\${} `;',
  },
  {
    code: "` ${'foo$'}{} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` foo\\${} `;',
  },
  {
    code: '` ${`$`} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` $ `;',
  },
  {
    code: '` ${`$`}{} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${} `;',
  },
  {
    code: '` ${`$`} {} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` $ {} `;',
  },
  {
    code: '` ${`$`}${undefined}{} `;',
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` $${undefined}{} `;', '` $undefined{} `;'],
  },
  {
    code: '` ${`foo$`}{} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` foo\\${} `;',
  },
  {
    code: "` ${'$'}${''}{} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` \\$${''}{} `;", '` \\${} `;'],
  },
  {
    code: "` ${'$'}${``}{} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` \\$${``}{} `;', '` \\${} `;'],
  },
  {
    code: "` ${'foo$'}${''}${``}{} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` foo\\$${''}{} `;", '` foo\\${} `;'],
  },
  {
    code: "` $${'{}'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${} `;',
  },
  {
    code: "` $${undefined}${'{}'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` $undefined${'{}'} `;", '` $undefined{} `;'],
  },
  {
    code: "` $${''}${undefined}${'{}'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` $${undefined}{} `;', '` $undefined{} `;'],
  },
  {
    code: "` \\$${'{}'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${} `;',
  },
  {
    code: "` $${'foo'}${'{'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` $foo${'{'} `;", '` $foo{ `;'],
  },
  {
    code: "` $${'{ foo'}${'{'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` \\${ foo${'{'} `;", '` \\${ foo{ `;'],
  },
  {
    code: "` \\\\$${'{}'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\\\${} `;',
  },
  {
    code: "` \\\\\\$${'{}'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\\\\\${} `;',
  },
  {
    code: "` foo$${'{}'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` foo\\${} `;',
  },
  {
    code: "` $${''}${'{}'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` \\$${'{}'} `;", '` \\${} `;'],
  },
  {
    code: "` $${''} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` $ `;',
  },
  {
    code: '` $${`{}`} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\${} `;',
  },
  {
    code: '` $${``}${`{}`} `;',
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` \\$${`{}`} `;', '` \\${} `;'],
  },
  {
    code: '` $${``}${`foo{}`} `;',
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` $${`foo{}`} `;', '` $foo{} `;'],
  },
  {
    code: "` $${`${''}${`${``}`}`}${`{a}`} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: [
      "` \\$${''}${`${``}`}${`{a}`} `;",
      '` \\$${``}{a} `;',
      '` \\${a} `;',
    ],
  },
  {
    code: "` $${''}${`{}`} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` \\$${`{}`} `;', '` \\${} `;'],
  },
  {
    code: "` $${``}${'{}'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` \\$${'{}'} `;", '` \\${} `;'],
  },
  {
    code: "` $${''}${``}${'{}'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ['` \\$${``}{} `;', '` \\${} `;'],
  },
  {
    code: "` ${'$'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` $ `;',
  },
  {
    code: "` ${'$'}${'{}'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` \\$${'{}'} `;", '` \\${} `;'],
  },
  {
    code: "` ${'$'}${''}${'{'} `;",
    errors: [
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
      { messageId: 'noUnnecessaryTemplateExpression' },
    ],
    output: ["` \\$${''}{ `;", '` \\${ `;'],
  },
  {
    code: '` ${`\n\\$`}{} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \n\\${} `;',
  },
  {
    code: '` ${`\n\\\\$`}{} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \n\\\\\\${} `;',
  },

  {
    code: "`${'\\u00E5'}`;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: "'\\u00E5';",
  },
  {
    code: "`${'\\n'}`;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: "'\\n';",
  },
  {
    code: "` ${'\\u00E5'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\u00E5 `;',
  },
  {
    code: "` ${'\\n'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\n `;',
  },
  {
    code: noFormat`\` \${"\\n"} \`;`,
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\n `;',
  },
  {
    code: '` ${`\\n`} `;',
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\n `;',
  },
  {
    code: noFormat`\` \${ 'A\\u0307\\u0323' } \`;`,
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` A\\u0307\\u0323 `;',
  },
  {
    code: "` ${'👨‍👩‍👧‍👦'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` 👨‍👩‍👧‍👦 `;',
  },
  {
    code: "` ${'\\ud83d\\udc68'} `;",
    errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
    output: '` \\ud83d\\udc68 `;',
  },
];

describe('fixer should not change runtime value', () => {
  for (const { code, output } of invalidCases) {
    if (!output) {
      continue;
    }

    test(code, () => {
      expect(eval(code)).toEqual(
        eval(Array.isArray(output) ? output.at(-1)! : output),
      );
    });
  }
});

ruleTester.run('no-unnecessary-template-expression', rule, {
  invalid: [
    ...invalidCases,
    {
      code: `
        function func<T extends string>(arg: T) {
          \`\${arg}\`;
        }
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
        function func<T extends string>(arg: T) {
          arg;
        }
      `,
    },
    {
      code: `
        declare const b: 'b';
        \`a\${b}\${'c'}\`;
      `,
      errors: [
        {
          column: 17,
          endColumn: 20,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
        declare const b: 'b';
        \`a\${b}c\`;
      `,
    },
    {
      code: `
declare const nested: string, interpolation: string;
\`use\${\`less\${nested}\${interpolation}\`}\`;
      `,
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
declare const nested: string, interpolation: string;
\`useless\${nested}\${interpolation}\`;
      `,
    },
    {
      code: noFormat`
        declare const string: 'a';
        \`\${   string   }\`;
      `,
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
        declare const string: 'a';
        string;
      `,
    },
    {
      code: `
        declare const string: 'a';
        \`\${string}\`;
      `,
      errors: [
        {
          column: 12,
          endColumn: 18,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
        declare const string: 'a';
        string;
      `,
    },
    {
      code: `
        declare const intersection: string & { _brand: 'test-brand' };
        \`\${intersection}\`;
      `,
      errors: [
        {
          column: 12,
          endColumn: 24,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
        declare const intersection: string & { _brand: 'test-brand' };
        intersection;
      `,
    },
    {
      code: "true ? `${'test' || ''}`.trim() : undefined;",
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: "true ? ('test' || '').trim() : undefined;",
    },
  ],

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

    `
\`not a useless \${String.raw\`nested interpolation \${a}\`}\`;
    `,
  ],
});
