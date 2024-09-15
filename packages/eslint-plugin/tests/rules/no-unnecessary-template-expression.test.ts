import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-template-expression';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
    },
  },
});

// const invalidCases: readonly InvalidTestCase<
//   'noUnnecessaryTemplateExpression',
//   []
// >[] = [
//   {
//     code: '`${1}`;',
//     output: '`1`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 5,
//       },
//     ],
//   },
//   {
//     code: '`${1n}`;',
//     output: '`1`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 6,
//       },
//     ],
//   },
//   {
//     code: '`${0o25}`;',
//     output: '`21`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 8,
//       },
//     ],
//   },
//   {
//     code: '`${0b1010} ${0b1111}`;',
//     output: '`10 15`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 10,
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 14,
//         endColumn: 20,
//       },
//     ],
//   },
//   {
//     code: '`${0x25}`;',
//     output: '`37`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 8,
//       },
//     ],
//   },
//   {
//     code: '`${/a/}`;',
//     output: '`/a/`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 7,
//       },
//     ],
//   },
//   {
//     code: '`${/a/gim}`;',
//     output: '`/a/gim`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 10,
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    1    }\`;`,
//     output: '`1`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    'a'    }\`;`,
//     output: `'a';`,
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    "a"    }\`;`,
//     output: `"a";`,
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    'a' + 'b'    }\`;`,
//     output: `'a' + 'b';`,
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: '`${true}`;',
//     output: '`true`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 8,
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    true    }\`;`,
//     output: '`true`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: '`${null}`;',
//     output: '`null`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 8,
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    null    }\`;`,
//     output: '`null`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: '`${undefined}`;',
//     output: '`undefined`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 13,
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${    undefined    }\`;`,
//     output: '`undefined`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: '`${Infinity}`;',
//     output: '`Infinity`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 12,
//       },
//     ],
//   },

//   {
//     code: '`${NaN}`;',
//     output: '`NaN`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 7,
//       },
//     ],
//   },

//   {
//     code: "`${'a'} ${'b'}`;",
//     output: '`a b`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 7,
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 11,
//         endColumn: 14,
//       },
//     ],
//   },

//   {
//     code: noFormat`\`\${   'a'   } \${   'b'   }\`;`,
//     output: '`a b`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: "`use${'less'}`;",
//     output: '`useless`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//       },
//     ],
//   },

//   {
//     code: '`use${`less`}`;',
//     output: '`useless`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//       },
//     ],
//   },
//   {
//     code: noFormat`
// \`u\${
//   // hopefully this comment is not needed.
//   'se'

// }\${
//   \`le\${  \`ss\`  }\`
// }\`;
//       `,
//     output: [
//       `
// \`use\${
//   \`less\`
// }\`;
//       `,
//       `
// \`useless\`;
//       `,
//     ],
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 4,
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 7,
//         column: 3,
//         endLine: 7,
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 7,
//         column: 10,
//         endLine: 7,
//       },
//     ],
//   },
//   {
//     code: noFormat`
// \`use\${
//   \`less\`
// }\`;
//       `,
//     output: `
// \`useless\`;
//       `,
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 3,
//         column: 3,
//         endColumn: 9,
//       },
//     ],
//   },

//   {
//     code: "`${'1 + 1 ='} ${2}`;",
//     output: '`1 + 1 = 2`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 13,
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 17,
//         endColumn: 18,
//       },
//     ],
//   },

//   {
//     code: "`${'a'} ${true}`;",
//     output: '`a true`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 7,
//       },
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 11,
//         endColumn: 15,
//       },
//     ],
//   },

//   {
//     code: "`${String(Symbol.for('test'))}`;",
//     output: "String(Symbol.for('test'));",
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//         line: 1,
//         column: 4,
//         endColumn: 30,
//       },
//     ],
//   },

//   {
//     code: "`${'`'}`;",
//     output: "'`';",
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: "`back${'`'}tick`;",
//     output: '`back\\`tick`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: "`dollar${'${`this is test`}'}sign`;",
//     output: '`dollar\\${\\`this is test\\`}sign`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: '`complex${\'`${"`${test}`"}`\'}case`;',
//     output: '`complex\\`\\${"\\`\\${test}\\`"}\\`case`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: "`some ${'\\\\${test}'} string`;",
//     output: '`some \\\\\\${test} string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: "`some ${'\\\\`'} string`;",
//     output: '`some \\\\\\` string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },

//   {
//     code: '`some ${/`/} string`;',
//     output: '`some /\\`/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/\\`/} string`;',
//     output: '`some /\\\\\\`/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/\\\\`/} string`;',
//     output: '`some /\\\\\\\\\\`/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/\\\\\\`/} string`;',
//     output: '`some /\\\\\\\\\\\\\\`/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/${}/} string`;',
//     output: '`some /\\${}/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/$ {}/} string`;',
//     output: '`some /$ {}/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/\\\\/} string`;',
//     output: '`some /\\\\\\\\/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/\\\\\\b/} string`;',
//     output: '`some /\\\\\\\\\\\\b/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: '`some ${/\\\\\\\\/} string`;',
//     output: '`some /\\\\\\\\\\\\\\\\/ string`;',
//     errors: [
//       {
//         messageId: 'noUnnecessaryTemplateExpression',
//       },
//     ],
//   },
//   {
//     code: "` ${''} `;",
//     output: '`  `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: noFormat`\` \${""} \`;`,
//     output: '`  `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${``} `;',
//     output: '`  `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: noFormat`\` \${'\\\`'} \`;`,
//     output: '` \\` `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'\\\\`'} `;",
//     output: '` \\\\\\` `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'$'}{} `;",
//     output: '` \\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: noFormat`\` \${'\\$'}{} \`;`,
//     output: '` \\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'\\\\$'}{} `;",
//     output: '` \\\\\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'\\\\$ '}{} `;",
//     output: '` \\\\$ {} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: noFormat`\` \${'\\\\\\$'}{} \`;`,
//     output: '` \\\\\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` \\\\${'\\\\$'}{} `;",
//     output: '` \\\\\\\\\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` $${'{$'}{} `;",
//     output: '` \\${\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` $${'${$'}{} `;",
//     output: '` $\\${\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'foo$'}{} `;",
//     output: '` foo\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${`$`} `;',
//     output: '` $ `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${`$`}{} `;',
//     output: '` \\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${`$`} {} `;',
//     output: '` $ {} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${`$`}${undefined}{} `;',
//     output: ['` $${undefined}{} `;', '` $undefined{} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: '` ${`foo$`}{} `;',
//     output: '` foo\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'$'}${''}{} `;",
//     output: ["` \\$${''}{} `;", '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` ${'$'}${``}{} `;",
//     output: ['` \\$${``}{} `;', '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` ${'foo$'}${''}${``}{} `;",
//     output: ["` foo\\$${''}{} `;", '` foo\\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${'{}'} `;",
//     output: '` \\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` $${undefined}${'{}'} `;",
//     output: ["` $undefined${'{}'} `;", '` $undefined{} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${''}${undefined}${'{}'} `;",
//     output: ['` $${undefined}{} `;', '` $undefined{} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` \\$${'{}'} `;",
//     output: '` \\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` $${'foo'}${'{'} `;",
//     output: ["` $foo${'{'} `;", '` $foo{ `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${'{ foo'}${'{'} `;",
//     output: ["` \\${ foo${'{'} `;", '` \\${ foo{ `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` \\\\$${'{}'} `;",
//     output: '` \\\\\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` \\\\\\$${'{}'} `;",
//     output: '` \\\\\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` foo$${'{}'} `;",
//     output: '` foo\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` $${''}${'{}'} `;",
//     output: ["` \\$${'{}'} `;", '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${''} `;",
//     output: '` $ `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` $${`{}`} `;',
//     output: '` \\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` $${``}${`{}`} `;',
//     output: ['` \\$${`{}`} `;', '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: '` $${``}${`foo{}`} `;',
//     output: ['` $${`foo{}`} `;', '` $foo{} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${`${''}${`${``}`}`}${`{a}`} `;",
//     output: [
//       "` \\$${''}${`${``}`}${`{a}`} `;",
//       '` \\$${``}{a} `;',
//       '` \\${a} `;',
//     ],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${''}${`{}`} `;",
//     output: ['` \\$${`{}`} `;', '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${``}${'{}'} `;",
//     output: ["` \\$${'{}'} `;", '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` $${''}${``}${'{}'} `;",
//     output: ['` \\$${``}{} `;', '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` ${'$'} `;",
//     output: '` $ `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'$'}${'{}'} `;",
//     output: ["` \\$${'{}'} `;", '` \\${} `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: "` ${'$'}${''}${'{'} `;",
//     output: ["` \\$${''}{ `;", '` \\${ `;'],
//     errors: [
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//       { messageId: 'noUnnecessaryTemplateExpression' },
//     ],
//   },
//   {
//     code: '` ${`\n\\$`}{} `;',
//     output: '` \n\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${`\n\\\\$`}{} `;',
//     output: '` \n\\\\\\${} `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },

//   {
//     code: "`${'\\u00E5'}`;",
//     output: "'\\u00E5';",
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "`${'\\n'}`;",
//     output: "'\\n';",
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'\\u00E5'} `;",
//     output: '` \\u00E5 `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'\\n'} `;",
//     output: '` \\n `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: noFormat`\` \${"\\n"} \`;`,
//     output: '` \\n `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: '` ${`\\n`} `;',
//     output: '` \\n `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: noFormat`\` \${ 'A\\u0307\\u0323' } \`;`,
//     output: '` A\\u0307\\u0323 `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'👨‍👩‍👧‍👦'} `;",
//     output: '` 👨‍👩‍👧‍👦 `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
//   {
//     code: "` ${'\\ud83d\\udc68'} `;",
//     output: '` \\ud83d\\udc68 `;',
//     errors: [{ messageId: 'noUnnecessaryTemplateExpression' }],
//   },
// ];

// describe('fixer should not change runtime value', () => {
//   for (const { code, output } of invalidCases) {
//     if (!output) {
//       continue;
//     }

//     test(code, () => {
//       expect(eval(code)).toEqual(
//         eval(Array.isArray(output) ? output.at(-1)! : output),
//       );
//     });
//   }
// });

ruleTester.run('no-unnecessary-template-expression', rule, {
  valid: [
    `
type testType = 'la';
type templateStringType1 = \`fa\${testType}fel\`;
    `,
    //     "const string = 'a';",
    //     'const string = `a`;',
    //     `
    //       declare const string: 'a';
    //       \`\${string}b\`;
    //     `,
    //     `
    //       declare const number: 1;
    //       \`\${number}b\`;
    //     `,
    //     `
    //       declare const boolean: true;
    //       \`\${boolean}b\`;
    //     `,
    //     `
    //       declare const nullish: null;
    //       \`\${nullish}-undefined\`;
    //     `,
    //     `
    //       declare const undefinedish: undefined;
    //       \`\${undefinedish}\`;
    //     `,
    //     `
    //       declare const left: 'a';
    //       declare const right: 'b';
    //       \`\${left}\${right}\`;
    //     `,
    //     `
    //       declare const left: 'a';
    //       declare const right: 'c';
    //       \`\${left}b\${right}\`;
    //     `,
    //     `
    //       declare const left: 'a';
    //       declare const center: 'b';
    //       declare const right: 'c';
    //       \`\${left}\${center}\${right}\`;
    //     `,
    //     '`1 + 1 = ${1 + 1}`;',
    //     '`true && false = ${true && false}`;',
    //     "tag`${'a'}${'b'}`;",
    //     '`${function () {}}`;',
    //     '`${() => {}}`;',
    //     '`${(...args: any[]) => args}`;',
    //     `
    //       declare const number: 1;
    //       \`\${number}\`;
    //     `,
    //     `
    //       declare const boolean: true;
    //       \`\${boolean}\`;
    //     `,
    //     `
    //       declare const nullish: null;
    //       \`\${nullish}\`;
    //     `,
    //     `
    //       declare const union: string | number;
    //       \`\${union}\`;
    //     `,
    //     `
    //       declare const unknown: unknown;
    //       \`\${unknown}\`;
    //     `,
    //     `
    //       declare const never: never;
    //       \`\${never}\`;
    //     `,
    //     `
    //       declare const any: any;
    //       \`\${any}\`;
    //     `,
    //     `
    //       function func<T extends number>(arg: T) {
    //         \`\${arg}\`;
    //       }
    //     `,
    //     `
    //       \`with
    //       new line\`;
    //     `,
    //     `
    //       declare const a: 'a';
    //       \`\${a} with
    //       new line\`;
    //     `,
    //     noFormat`
    //       \`with windows \r new line\`;
    //     `,
    //     `
    // \`not a useless \${String.raw\`nested interpolation \${a}\`}\`;
    //     `,
  ],

  invalid: [
    //     ...invalidCases,
    //     {
    //       code: `
    //         function func<T extends string>(arg: T) {
    //           \`\${arg}\`;
    //         }
    //       `,
    //       output: `
    //         function func<T extends string>(arg: T) {
    //           arg;
    //         }
    //       `,
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //           line: 3,
    //           column: 14,
    //           endColumn: 17,
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    //         declare const b: 'b';
    //         \`a\${b}\${'c'}\`;
    //       `,
    //       output: `
    //         declare const b: 'b';
    //         \`a\${b}c\`;
    //       `,
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //           line: 3,
    //           column: 17,
    //           endColumn: 20,
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    // declare const nested: string, interpolation: string;
    // \`use\${\`less\${nested}\${interpolation}\`}\`;
    //       `,
    //       output: `
    // declare const nested: string, interpolation: string;
    // \`useless\${nested}\${interpolation}\`;
    //       `,
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //         },
    //       ],
    //     },
    //     {
    //       code: noFormat`
    //         declare const string: 'a';
    //         \`\${   string   }\`;
    //       `,
    //       output: `
    //         declare const string: 'a';
    //         string;
    //       `,
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    //         declare const string: 'a';
    //         \`\${string}\`;
    //       `,
    //       output: `
    //         declare const string: 'a';
    //         string;
    //       `,
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //           line: 3,
    //           column: 12,
    //           endColumn: 18,
    //         },
    //       ],
    //     },
    //     {
    //       code: `
    //         declare const intersection: string & { _brand: 'test-brand' };
    //         \`\${intersection}\`;
    //       `,
    //       output: `
    //         declare const intersection: string & { _brand: 'test-brand' };
    //         intersection;
    //       `,
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //           line: 3,
    //           column: 12,
    //           endColumn: 24,
    //         },
    //       ],
    //     },
    //     {
    //       code: "true ? `${'test' || ''}`.trim() : undefined;",
    //       output: "true ? ('test' || '').trim() : undefined;",
    //       errors: [
    //         {
    //           messageId: 'noUnnecessaryTemplateExpression',
    //         },
    //       ],
    //     },
    {
      code: "type templateStringType1 = `fa${'la'}fel`;",
      output: 'type templateStringType1 = `falafel`;',
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
    },
    {
      code: `
type testType = 'blah';
type templateStringType1 = \`\${testType}\`;
      `,
      output: `
type testType = 'blah';
type templateStringType1 = testType;
      `,
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
    },
    {
      code: `
type testType = 'blah' | 'blah2';
type templateStringType1 = \`\${testType}\`;
      `,
      output: `
type testType = 'blah' | 'blah2';
type templateStringType1 = testType;
      `,
      errors: [
        {
          messageId: 'noUnnecessaryTemplateExpression',
        },
      ],
    },
  ],
});
