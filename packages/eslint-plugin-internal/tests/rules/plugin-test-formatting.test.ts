import rule from '../../src/rules/plugin-test-formatting';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
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
function wrapWithOutput(
  strings: TemplateStringsArray,
  ...keys: string[]
): string {
  const lastIndex = strings.length - 1;
  const code =
    strings.slice(0, lastIndex).reduce((p, s, i) => p + s + keys[i], '') +
    strings[lastIndex];
  return `
ruleTester.run({
  invalid: [
    {
      code: ${code},
      output: ${code},
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
    wrap`noFormat\`const a = 1;\``,
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

    // empty linems are valid when everything else is indented
    wrap`\`
${CODE_INDENT}const a = 1;

${CODE_INDENT}const b = 1;
${PARENT_INDENT}\``,
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
      // make sure it escapes backticks
      output: wrap`\`
${CODE_INDENT}const a = \\\`\\\${a}\\\`;
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },

    // sanity check that it runs on both output and code properties
    {
      code: wrapWithOutput`\`
${CODE_INDENT}const a="1";
${CODE_INDENT}          const b    =   "2";
${PARENT_INDENT}\``,
      output: wrapWithOutput`\`
${CODE_INDENT}const a = '1';
${CODE_INDENT}const b = '2';
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
        {
          messageId: 'invalidFormattingErrorTest',
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
              output: 'const x = 1;',
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

    // checks tests with .trimRight calls
    {
      code: wrap`'const a=1;'.trimRight()`,
      output: wrap`'const a = 1;'.trimRight()`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
    },
    {
      code: wrap`\`const a = "1";
${CODE_INDENT}\`.trimRight()`,
      output: wrap`\`
const a = "1";
${CODE_INDENT}\`.trimRight()`,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
    },
  ],
});
