import rule from '../../src/rules/plugin-test-formatting';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
    sourceType: 'module',
  },
});

const CODE_INDENT = '        ';
const PARENT_INDENT = '      ';
function wrap(strings: TemplateStringsArray, ...keys: string[]): string {
  const lastIndex = strings.length - 1;
  const code =
    strings.slice(0, lastIndex).reduce((p, s, i) => p + s + keys[i], '') +
    strings[lastIndex];
  return `
ruleTester.run({
  valid: [
    {
      code: ${code},
    },
  ],
});
  `;
}
ruleTester.run('plugin-test-formatting', rule, {
  valid: [
    // sanity check for valid tests non-object style
    `
ruleTester.run({
  valid: [
    'const a = 1;',
    \`
      const a = 1;
    \`,
    \`
const a = 1;
    \`,
    noFormat\`const x=1;\`,
  ],
});
    `,
    wrap`'const a = 1;'`,
    wrap`\`
${CODE_INDENT}const a = 1;
${PARENT_INDENT}\``,
    wrap`\`
const a = 1;
${PARENT_INDENT}\``,
    // sanity check suggestion validation
    // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
    `
      ruleTester.run({
        invalid: [
          {
            code: 'const a = 1;',
            output: 'const a = 1;',
            errors: [
              {
                messageId: 'foo',
                suggestions: [
                  {
                    messageId: 'bar',
                    output: 'const a = 1;',
                  },
                ],
              }
            ]
          },
          {
            code: \`
              const a = 1;
            \`,
            output: \`
              const a = 1;
            \`,
            errors: [
              {
                messageId: 'foo',
                suggestions: [
                  {
                    messageId: 'bar',
                    output: \`
                      const a = 1;
                    \`,
                  },
                ],
              }
            ]
          },
          {
            code: \`
const a = 1;
            \`,
            output: \`
const a = 1;
            \`,
            errors: [
              {
                messageId: 'foo',
                suggestions: [
                  {
                    messageId: 'bar',
                    output: \`
const a = 1;
                    \`,
                  },
                ],
              }
            ]
          },
        ],
      });
    `,

    // test the only option
    {
      code: wrap`'const x=1;'`,
      options: [
        {
          formatWithPrettier: false,
        },
      ],
    },

    // empty lines are valid when everything else is indented
    wrap`\`
${CODE_INDENT}const a = 1;

${CODE_INDENT}const b = 1;
${PARENT_INDENT}\``,

    // random, unannotated variables aren't checked
    `
const test1 = {
  code: 'const badlyFormatted         = "code"',
};
const test2 = {
  valid: [
    'const badlyFormatted         = "code"',
    {
      code: 'const badlyFormatted         = "code"',
    },
  ],
  invalid: [
    {
      code: 'const badlyFormatted         = "code"',
      errors: [],
    },
  ],
};
    `,

    // TODO - figure out how to handle this pattern
    `
import { TSESLint } from '@typescript-eslint/utils';

const test = [
  {
    code: 'const badlyFormatted         = "code1"',
  },
  {
    code: 'const badlyFormatted         = "code2"',
  },
].map<TSESLint.InvalidTestCase<[]>>(test => ({
  code: test.code,
  errors: [],
}));
    `,
  ],
  invalid: [
    // Literal
    {
      code: wrap`'const a=1;'`,
      output: wrap`'const a = 1;'`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    {
      code: wrap`'const a="1";'`,
      output: wrap`"const a = '1';"`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    {
      code: wrap`"const a='1';"`,
      output: wrap`"const a = '1';"`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    {
      code: wrap`'for (const x of y) {}'`,
      output: wrap`\`for (const x of y) {
}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    {
      code: wrap`'for (const x of \`asdf\`) {}'`,
      // make sure it escapes the backticks
      output: wrap`\`for (const x of \\\`asdf\\\`) {
}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    // TemplateLiteral
    // singleLineQuotes
    {
      code: wrap`\`const a = 1;\``,
      output: wrap`'const a = 1;'`,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
      ],
    },
    {
      code: wrap`\`const a = '1'\``,
      output: wrap`"const a = '1'"`,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
      ],
    },
    {
      code: wrap`\`const a = "1";\``,
      output: wrap`'const a = "1";'`,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
      ],
    },
    // templateLiteralEmptyEnds
    {
      code: wrap`\`const a = "1";
${PARENT_INDENT}\``,
      output: wrap`\`
const a = "1";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
    },
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";\``,
      output: wrap`\`
${CODE_INDENT}const a = "1";
\``,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
    },
    {
      code: wrap`\`const a = "1";
${CODE_INDENT}const b = "2";\``,
      output: wrap`\`
const a = "1";
${CODE_INDENT}const b = "2";
\``,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
    },
    // templateLiteralLastLineIndent
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";
\``,
      output: wrap`\`
${CODE_INDENT}const a = "1";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'templateLiteralLastLineIndent',
        },
      ],
    },
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";
                      \``,
      output: wrap`\`
${CODE_INDENT}const a = "1";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'templateLiteralLastLineIndent',
        },
      ],
    },
    // templateStringRequiresIndent
    {
      code: wrap`\`
  const a = "1";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'templateStringRequiresIndent',
          data: {
            indent: CODE_INDENT.length,
          },
        },
      ],
    },
    {
      code: `
ruleTester.run({
  valid: [
    \`
    const a = "1";
    \`,
  ],
});
      `,
      errors: [
        {
          messageId: 'templateStringRequiresIndent',
          data: {
            indent: 6,
          },
        },
      ],
    },
    // templateStringMinimumIndent
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";
  const b = "2";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'templateStringMinimumIndent',
          data: {
            indent: CODE_INDENT.length,
          },
        },
      ],
    },
    // invalidFormatting
    {
      code: wrap`\`
${CODE_INDENT}const a="1";
${CODE_INDENT}          const b    =   "2";
${PARENT_INDENT}\``,
      output: wrap`\`
${CODE_INDENT}const a = '1';
${CODE_INDENT}const b = '2';
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    {
      code: wrap`\`
${CODE_INDENT}const a=\\\`\\\${a}\\\`;
${PARENT_INDENT}\``,
      output: wrap`\`
${CODE_INDENT}const a = \\\`\\\${a}\\\`;
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    // noUnnecessaryNoFormat
    {
      code: wrap`noFormat\`const a = 1;\``,
      output: wrap`'const a = 1;'`,
      errors: [
        {
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
    },
    {
      code: wrap`
noFormat\`
async function foo() {}
async function bar() {}
\``,
      output: wrap`
\`
async function foo() {}
async function bar() {}
\``,
      errors: [
        {
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
    },

    // sanity check that it handles suggestion output
    {
      code: `
ruleTester.run({
  valid: [],
  invalid: [
    {
      code: 'const x=1;',
      errors: [
        {
          messageId: 'foo',
          suggestions: [
            {
              messageId: 'bar',
              output: 'const x=1;',
            },
          ],
        },
      ],
    },
  ],
});
      `,
      output: `
ruleTester.run({
  valid: [],
  invalid: [
    {
      code: 'const x = 1;',
      errors: [
        {
          messageId: 'foo',
          suggestions: [
            {
              messageId: 'bar',
              output: 'const x=1;',
            },
          ],
        },
      ],
    },
  ],
});
      `,
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
    },

    // sanity check that it runs on all tests
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`foo\`,
    },
    {
      code: \`foo
\`,
    },
    {
      code: \`
      foo\`,
    },
  ],
  invalid: [
    {
      code: \`foo\`,
    },
    {
      code: \`foo
\`,
    },
    {
      code: \`
      foo\`,
    },
  ],
});
      `,
      output: `
ruleTester.run({
  valid: [
    {
      code: 'foo',
    },
    {
      code: \`
foo
\`,
    },
    {
      code: \`
      foo
\`,
    },
  ],
  invalid: [
    {
      code: 'foo',
    },
    {
      code: \`
foo
\`,
    },
    {
      code: \`
      foo
\`,
    },
  ],
});
      `,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
        {
          messageId: 'templateLiteralEmptyEnds',
        },
        {
          messageId: 'templateLiteralEmptyEnds',
        },
        {
          messageId: 'singleLineQuotes',
        },
        {
          messageId: 'templateLiteralEmptyEnds',
        },
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
    },

    // handles prettier errors
    {
      code: wrap`'const x = ";'`,
      errors: [
        {
          messageId: 'prettierException',
          data: {
            message: 'Unterminated string literal.',
          },
        },
      ],
    },

    // annotated variables are checked
    {
      code: `
const test: RunTests = {
  valid: [
    'const badlyFormatted         = "code"',
    {
      code: 'const badlyFormatted         = "code"',
    },
  ],
  invalid: [
    {
      code: 'const badlyFormatted         = "code"',
      errors: [],
    },
  ],
};
      `,
      output: `
const test: RunTests = {
  valid: [
    "const badlyFormatted = 'code';",
    {
      code: "const badlyFormatted = 'code';",
    },
  ],
  invalid: [
    {
      code: "const badlyFormatted = 'code';",
      errors: [],
    },
  ],
};
      `,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
        {
          messageId: 'invalidFormatting',
        },
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
    },
    {
      code: `
import { TSESLint } from '@typescript-eslint/utils';

const test: TSESLint.RunTests<'', []> = {
  valid: [
    'const badlyFormatted         = "code"',
    {
      code: 'const badlyFormatted         = "code"',
    },
  ],
  invalid: [
    {
      code: 'const badlyFormatted         = "code"',
      errors: [],
    },
  ],
};
      `,
      output: `
import { TSESLint } from '@typescript-eslint/utils';

const test: TSESLint.RunTests<'', []> = {
  valid: [
    "const badlyFormatted = 'code';",
    {
      code: "const badlyFormatted = 'code';",
    },
  ],
  invalid: [
    {
      code: "const badlyFormatted = 'code';",
      errors: [],
    },
  ],
};
      `,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
        {
          messageId: 'invalidFormatting',
        },
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
    },
    {
      code: `
import { TSESLint } from '@typescript-eslint/utils';

const test: TSESLint.ValidTestCase<[]> = {
  code: 'const badlyFormatted         = "code"',
};
      `,
      output: `
import { TSESLint } from '@typescript-eslint/utils';

const test: TSESLint.ValidTestCase<[]> = {
  code: "const badlyFormatted = 'code';",
};
      `,
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
    },
    {
      code: `
import { TSESLint } from '@typescript-eslint/utils';

const test: TSESLint.InvalidTestCase<'', []> = {
  code: 'const badlyFormatted         = "code1"',
  errors: [
    {
      code: 'const badlyFormatted         = "code2"',
      // shouldn't get fixed as per rule ignoring output
      output: 'const badlyFormatted         = "code3"',
      suggestions: [
        {
          messageId: '',
          // shouldn't get fixed as per rule ignoring output
          output: 'const badlyFormatted         = "code4"',
        },
      ],
    },
  ],
};
      `,
      output: `
import { TSESLint } from '@typescript-eslint/utils';

const test: TSESLint.InvalidTestCase<'', []> = {
  code: "const badlyFormatted = 'code1';",
  errors: [
    {
      code: "const badlyFormatted = 'code2';",
      // shouldn't get fixed as per rule ignoring output
      output: 'const badlyFormatted         = "code3"',
      suggestions: [
        {
          messageId: '',
          // shouldn't get fixed as per rule ignoring output
          output: 'const badlyFormatted         = "code4"',
        },
      ],
    },
  ],
};
      `,
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
    },
  ],
});
