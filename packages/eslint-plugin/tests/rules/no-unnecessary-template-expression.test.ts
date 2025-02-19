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
        column: 2,
        endColumn: 6,
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
        column: 2,
        endColumn: 7,
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
        column: 2,
        endColumn: 9,
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
        column: 2,
        endColumn: 11,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 12,
        endColumn: 21,
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
        column: 2,
        endColumn: 9,
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
        column: 2,
        endColumn: 8,
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
        column: 2,
        endColumn: 11,
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
        column: 2,
        endColumn: 9,
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
        column: 2,
        endColumn: 9,
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
        column: 2,
        endColumn: 14,
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
        column: 2,
        endColumn: 13,
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
        column: 2,
        endColumn: 8,
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
        column: 2,
        endColumn: 8,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 9,
        endColumn: 15,
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
        column: 2,
        endColumn: 2,
        endLine: 8,
        line: 6,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 6,
        endColumn: 17,
        endLine: 7,
        line: 7,
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: [
      `
\`u\${
  // hopefully this comment is not needed.
  'se'

}le\${  \`ss\`  }\`;
      `,
      `
\`u\${
  // hopefully this comment is not needed.
  'se'

}less\`;
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
        column: 5,
        endColumn: 2,
        endLine: 4,
        line: 2,
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
        column: 2,
        endColumn: 14,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 15,
        endColumn: 19,
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
        column: 2,
        endColumn: 8,
        line: 1,
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        column: 9,
        endColumn: 16,
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
        column: 2,
        endColumn: 31,
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
  {
    code: `
\`
this code does not have trailing whitespace: \${' '}\\n even though it might look it.\`;
    `,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `
\`
this code does not have trailing whitespace:  \\n even though it might look it.\`;
    `,
  },
  {
    code: `
\`
this code has trailing position template expression \${'but it isn\\'t whitespace'}
    \`;
    `,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `
\`
this code has trailing position template expression but it isn\\'t whitespace
    \`;
    `,
  },
  {
    code: noFormat`
\`trailing whitespace followed by escaped windows newline: \${' '}\\r\\n\`;
    `,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: `
\`trailing whitespace followed by escaped windows newline:  \\r\\n\`;
    `,
  },
  {
    code: `
\`template literal with interpolations followed by newline: \${\` \${'interpolation'} \`}
\`;
    `,
    errors: [
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
      {
        messageId: 'noUnnecessaryTemplateExpression',
      },
    ],
    output: [
      `
\`template literal with interpolations followed by newline:  \${'interpolation'}${' '}
\`;
    `,
      `
\`template literal with interpolations followed by newline:  interpolation${' '}
\`;
    `,
    ],
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
  valid: [
    "const string = 'a';",
    'const string = `a`;',
    'const string = `NaN: ${/* comment */ NaN}`;',
    'const string = `undefined: ${/* comment */ undefined}`;',
    'const string = `Infinity: ${Infinity /* comment */}`;',
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
    `
\`
this code has trailing whitespace: \${'    '}
    \`;
    `,
    `
\`
this code has trailing whitespace: \${\`    \`}
    \`;
    `,
    noFormat`
\`this code has trailing whitespace with a windows \\\r new line: \${' '}\r\n\`;
    `,
    `
\`trailing position interpolated empty string also makes whitespace clear    \${''}
\`;
    `,
    `
\`
\${/* intentional comment before */ 'bar'}
...\`;
    `,
    `
\`
\${'bar' /* intentional comment after */}
...\`;
    `,
    `
\`
\${/* intentional comment before */ 'bar' /* intentional comment after */}
...\`;
    `,
    `
\`\${/* intentional  before */ 'bar'}\`;
    `,
    `
\`\${'bar' /* intentional comment after */}\`;
    `,
    `
\`\${/* intentional comment before */ 'bar' /* intentional comment after */}\`;
    `,
    `
\`\${
  // intentional comment before
  'bar'
}\`;
    `,
    `
\`\${
  'bar'
  // intentional comment after
}\`;
    `,
    `
      function getTpl<T>(input: T) {
        return \`\${input}\`;
      }
    `,
    `
type FooBarBaz = \`foo\${/* comment */ 'bar'}"baz"\`;
    `,
    `
enum Foo {
  A = 'A',
  B = 'B',
}
type Foos = \`\${Foo}\`;
    `,
    `
type Foo = 'A' | 'B';
type Bar = \`foo\${Foo}foo\`;
    `,
    `
type Foo =
  \`trailing position interpolated empty string also makes whitespace clear    \${''}
\`;
    `,
    noFormat`
type Foo = \`this code has trailing whitespace with a windows \\\r new line: \${\` \`}\r\n\`;
    `,
    "type Foo = `${'foo' | 'bar' | null}`;",

    `
type StringOrNumber = string | number;
type Foo = \`\${StringOrNumber}\`;
    `,
    `
enum Foo {
  A = 1,
  B = 2,
}
type Bar = \`\${Foo.A}\`;
    `,
    `
enum Enum1 {
  A = 'A1',
  B = 'B1',
}

enum Enum2 {
  A = 'A2',
  B = 'B2',
}

type Union = \`\${Enum1 | Enum2}\`;
    `,
    `
enum Enum1 {
  A = 'A1',
  B = 'B1',
}

enum Enum2 {
  A = 'A2',
  B = 'B2',
}

type Union = \`\${Enum1.A | Enum2.B}\`;
    `,
    `
enum Enum1 {
  A = 'A1',
  B = 'B1',
}

enum Enum2 {
  A = 'A2',
  B = 'B2',
}
type Enums = Enum1 | Enum2;
type Union = \`\${Enums}\`;
    `,
    `
enum Enum {
  A = 'A',
  B = 'A',
}

type Intersection = \`\${Enum1.A & string}\`;
    `,
    `
enum Foo {
  A = 'A',
  B = 'B',
}
type Bar = \`\${Foo.A}\`;
    `,
    `
function foo<T extends string>() {
  const a: \`\${T}\` = 'a';
}
    `,
    'type T<A extends string> = `${A}`;',
  ],

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
          column: 12,
          endColumn: 18,
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
          column: 15,
          endColumn: 21,
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
          column: 10,
          endColumn: 19,
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
          column: 10,
          endColumn: 25,
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
    {
      code: 'type Foo = `${1}`;',
      errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
      output: 'type Foo = `1`;',
    },
    {
      code: 'type Foo = `${null}`;',
      errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
      output: 'type Foo = `null`;',
    },
    {
      code: 'type Foo = `${undefined}`;',
      errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
      output: 'type Foo = `undefined`;',
    },
    {
      code: "type Foo = `${'foo'}`;",
      errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
      output: "type Foo = 'foo';",
    },
    {
      code: `
type Foo = 'A' | 'B';
type Bar = \`\${Foo}\`;
      `,
      errors: [
        {
          column: 13,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: `
type Foo = 'A' | 'B';
type Bar = Foo;
      `,
    },
    {
      code: `
type Foo = 'A' | 'B';
type Bar = \`\${\`\${Foo}\`}\`;
      `,
      errors: [
        {
          column: 13,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
        {
          column: 16,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: [
        `
type Foo = 'A' | 'B';
type Bar = \`\${Foo}\`;
      `,

        `
type Foo = 'A' | 'B';
type Bar = Foo;
      `,
      ],
    },
    {
      code: "type FooBarBaz = `foo${'bar'}baz`;",
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: 'type FooBarBaz = `foobarbaz`;',
    },
    {
      code: 'type FooBar = `foo${`bar`}`;',
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: 'type FooBar = `foobar`;',
    },
    {
      code: "type FooBar = `${'foo' | 'bar'}`;",
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
      output: "type FooBar = 'foo' | 'bar';",
    },
  ],
});
