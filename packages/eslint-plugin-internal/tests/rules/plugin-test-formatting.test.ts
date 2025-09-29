import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/plugin-test-formatting';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: getFixturesRootDir(),
    },
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
  invalid: [
    // Literal
    {
      code: wrap`'const a=1;'`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: wrap`'const a = 1;'`,
    },
    {
      code: wrap`'const a="1";'`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: wrap`"const a = '1';"`,
    },
    {
      code: wrap`"const a='1';"`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: wrap`"const a = '1';"`,
    },
    {
      code: wrap`'for (const x of y) {}'`,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: [
        wrap`\`for (const x of y) {
}\``,
        wrap`\`
for (const x of y) {
}
\``,
        wrap`\`
for (const x of y) {
}
${PARENT_INDENT}\``,
      ],
    },
    {
      code: wrap`'for (const x of \`asdf\`) {}'`,
      // make sure it escapes the backticks
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: [
        wrap`\`for (const x of \\\`asdf\\\`) {
}\``,
        wrap`\`
for (const x of \\\`asdf\\\`) {
}
\``,
        wrap`\`
for (const x of \\\`asdf\\\`) {
}
${PARENT_INDENT}\``,
      ],
    },
    // TemplateLiteral
    // singleLineQuotes
    {
      code: wrap`\`const a = 1;\``,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
      ],
      output: wrap`'const a = 1;'`,
    },
    {
      code: wrap`\`const a = '1'\``,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
      ],
      output: [wrap`"const a = '1'"`, wrap`"const a = '1';"`],
    },
    {
      code: wrap`\`const a = "1";\``,
      errors: [
        {
          messageId: 'singleLineQuotes',
        },
      ],
      output: [wrap`'const a = "1";'`, wrap`"const a = '1';"`],
    },
    // templateLiteralEmptyEnds
    {
      code: wrap`\`const a = "1";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
      output: [
        wrap`\`
const a = "1";
${PARENT_INDENT}\``,
        wrap`\`
const a = '1';
${PARENT_INDENT}\``,
      ],
    },
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";\``,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
      output: [
        wrap`\`
${CODE_INDENT}const a = "1";
\``,
        wrap`\`
${CODE_INDENT}const a = "1";
${PARENT_INDENT}\``,
        wrap`\`
${CODE_INDENT}const a = '1';
${PARENT_INDENT}\``,
      ],
    },
    {
      code: wrap`\`const a = "1";
${CODE_INDENT}const b = "2";\``,
      errors: [
        {
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
      output: [
        wrap`\`
const a = "1";
${CODE_INDENT}const b = "2";
\``,
        wrap`\`
const a = "1";
${CODE_INDENT}const b = "2";
${PARENT_INDENT}\``,
        wrap`\`
const a = '1';
const b = '2';
${PARENT_INDENT}\``,
      ],
    },
    // templateLiteralLastLineIndent
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";
\``,
      errors: [
        {
          messageId: 'templateLiteralLastLineIndent',
        },
      ],
      output: [
        wrap`\`
${CODE_INDENT}const a = "1";
${PARENT_INDENT}\``,
        wrap`\`
${CODE_INDENT}const a = '1';
${PARENT_INDENT}\``,
      ],
    },
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";
                      \``,
      errors: [
        {
          messageId: 'templateLiteralLastLineIndent',
        },
      ],
      output: [
        wrap`\`
${CODE_INDENT}const a = "1";
${PARENT_INDENT}\``,
        wrap`\`
${CODE_INDENT}const a = '1';
${PARENT_INDENT}\``,
      ],
    },
    // templateStringRequiresIndent
    {
      code: wrap`\`
  const a = "1";
${PARENT_INDENT}\``,
      errors: [
        {
          data: {
            indent: CODE_INDENT.length,
          },
          messageId: 'templateStringRequiresIndent',
        },
      ],
      output: null,
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
          data: {
            indent: 6,
          },
          messageId: 'templateStringRequiresIndent',
        },
      ],
      output: null,
    },
    // templateStringMinimumIndent
    {
      code: wrap`\`
${CODE_INDENT}const a = "1";
  const b = "2";
${PARENT_INDENT}\``,
      errors: [
        {
          data: {
            indent: CODE_INDENT.length,
          },
          messageId: 'templateStringMinimumIndent',
        },
      ],
      output: null,
    },
    // invalidFormatting
    {
      code: wrap`\`
${CODE_INDENT}const a="1";
${CODE_INDENT}          const b    =   "2";
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: wrap`\`
${CODE_INDENT}const a = '1';
${CODE_INDENT}const b = '2';
${PARENT_INDENT}\``,
    },
    {
      code: wrap`\`
${CODE_INDENT}const a=\\\`\\\${a}\\\`;
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'invalidFormatting',
        },
      ],
      output: wrap`\`
${CODE_INDENT}const a = \\\`\\\${a}\\\`;
${PARENT_INDENT}\``,
    },
    // noUnnecessaryNoFormat
    {
      code: wrap`noFormat\`const a = 1;\``,
      errors: [
        {
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
      output: wrap`'const a = 1;'`,
    },
    {
      code: wrap`
noFormat\`
async function foo() {}
async function bar() {}
\``,
      errors: [
        {
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
      output: wrap`
\`
async function foo() {}
async function bar() {}
\``,
    },
    {
      code: wrap`
${PARENT_INDENT}noFormat\`
${CODE_INDENT}async function bar() {}
${CODE_INDENT}async function foo() {}
${PARENT_INDENT}\``,
      errors: [
        {
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
      output: wrap`
${PARENT_INDENT}\`
${CODE_INDENT}async function bar() {}
${CODE_INDENT}async function foo() {}
${PARENT_INDENT}\``,
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
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
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
      output: [
        `
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
        `
ruleTester.run({
  valid: [
    {
      code: 'foo;',
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
      code: 'foo;',
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
        `
ruleTester.run({
  valid: [
    {
      code: 'foo;',
    },
    {
      code: \`
foo;
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
      code: 'foo;',
    },
    {
      code: \`
foo;
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
      ],
    },

    // handles prettier errors
    {
      code: wrap`'const x = ";'`,
      errors: [
        {
          data: {
            message: 'Unterminated string literal.',
          },
          messageId: 'prettierException',
        },
      ],
      output: null,
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
    },
    {
      code: `
import { RunTests } from '@typescript-eslint/rule-tester';

const test: RunTests<'', []> = {
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
      output: `
import { RunTests } from '@typescript-eslint/rule-tester';

const test: RunTests<'', []> = {
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
    },
    {
      code: `
import { ValidTestCase } from '@typescript-eslint/rule-tester';

const test: ValidTestCase<[]> = {
  code: 'const badlyFormatted         = "code"',
};
      `,
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
      output: `
import { ValidTestCase } from '@typescript-eslint/rule-tester';

const test: ValidTestCase<[]> = {
  code: "const badlyFormatted = 'code';",
};
      `,
    },
    {
      code: `
import { InvalidTestCase } from '@typescript-eslint/rule-tester';

const test: InvalidTestCase<'', []> = {
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
      errors: [
        {
          messageId: 'invalidFormattingErrorTest',
        },
        {
          messageId: 'invalidFormattingErrorTest',
        },
      ],
      output: `
import { InvalidTestCase } from '@typescript-eslint/rule-tester';

const test: InvalidTestCase<'', []> = {
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
    },
  ],
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
import { InvalidTestCase } from '@typescript-eslint/rule-tester';

const test = [
  {
    code: 'const badlyFormatted         = "code1"',
  },
  {
    code: 'const badlyFormatted         = "code2"',
  },
].map<InvalidTestCase<[]>>(test => ({
  code: test.code,
  errors: [],
}));
    `,
  ],
});
