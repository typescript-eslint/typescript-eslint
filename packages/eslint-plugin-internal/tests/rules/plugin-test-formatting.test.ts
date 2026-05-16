import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/plugin-test-formatting.js';
import { getFixturesRootDir } from '../RuleTester.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      projectService: false,
      tsconfigRootDir: getFixturesRootDir(),
    },
  },
});

ruleTester.run('plugin-test-formatting', rule, {
  invalid: [
    // Literal
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: 'const a=1;',
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 25,
          endLine: 5,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: 'const a = 1;',
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: 'const a="1";',
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: "const a = '1';",
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: "const a='1';",
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: "const a = '1';",
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: 'for (const x of y) {}',
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 36,
          endLine: 5,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`for (const x of y) {
}\`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
for (const x of y) {
}
\`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
for (const x of y) {
}
      \`,
    },
  ],
});
      `,
      ],
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: 'for (const x of \`asdf\`) {}',
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 41,
          endLine: 5,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`for (const x of \\\`asdf\\\`) {
}\`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
for (const x of \\\`asdf\\\`) {
}
\`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
for (const x of \\\`asdf\\\`) {
}
      \`,
    },
  ],
});
      `,
      ],
    },
    // TemplateLiteral
    // singleLineQuotes
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`const a = 1;\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'singleLineQuotes',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: 'const a = 1;',
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`const a = '1'\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 28,
          endLine: 5,
          line: 5,
          messageId: 'singleLineQuotes',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: "const a = '1'",
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: "const a = '1';",
    },
  ],
});
      `,
      ],
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`const a = "1";\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 29,
          endLine: 5,
          line: 5,
          messageId: 'singleLineQuotes',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: 'const a = "1";',
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: "const a = '1';",
    },
  ],
});
      `,
      ],
    },
    // templateLiteralEmptyEnds
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`const a = "1";
      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 8,
          endLine: 6,
          line: 5,
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`
const a = "1";
      \`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
const a = '1';
      \`,
    },
  ],
});
      `,
      ],
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 24,
          endLine: 6,
          line: 5,
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
\`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
      \`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = '1';
      \`,
    },
  ],
});
      `,
      ],
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`const a = "1";
        const b = "2";\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 24,
          endLine: 6,
          line: 5,
          messageId: 'templateLiteralEmptyEnds',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`
const a = "1";
        const b = "2";
\`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
const a = "1";
        const b = "2";
      \`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
const a = '1';
const b = '2';
      \`,
    },
  ],
});
      `,
      ],
    },
    // templateLiteralLastLineIndent
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 2,
          endLine: 7,
          line: 5,
          messageId: 'templateLiteralLastLineIndent',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
      \`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = '1';
      \`,
    },
  ],
});
      `,
      ],
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
                      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 24,
          endLine: 7,
          line: 5,
          messageId: 'templateLiteralLastLineIndent',
        },
      ],
      output: [
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
      \`,
    },
  ],
});
      `,
        `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = '1';
      \`,
    },
  ],
});
      `,
      ],
    },
    // templateStringRequiresIndent
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
  const a = "1";
      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          data: {
            indent: 8,
          },
          endColumn: 8,
          endLine: 7,
          line: 5,
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
          column: 5,
          data: {
            indent: 6,
          },
          endColumn: 6,
          endLine: 6,
          line: 4,
          messageId: 'templateStringRequiresIndent',
        },
      ],
      output: null,
    },
    // templateStringMinimumIndent
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = "1";
  const b = "2";
      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          data: {
            indent: 8,
          },
          endColumn: 8,
          endLine: 8,
          line: 5,
          messageId: 'templateStringMinimumIndent',
        },
      ],
      output: null,
    },
    // invalidFormatting
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a="1";
                  const b    =   "2";
      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 8,
          endLine: 8,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = '1';
        const b = '2';
      \`,
    },
  ],
});
      `,
    },
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a=\\\`\\\${a}\\\`;
      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 8,
          endLine: 7,
          line: 5,
          messageId: 'invalidFormatting',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = \\\`\\\${a}\\\`;
      \`,
    },
  ],
});
      `,
    },
    // noUnnecessaryNoFormat
    {
      code: `
ruleTester.run({
  valid: [
    {
      code: noFormat\`const a = 1;\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          endColumn: 35,
          endLine: 5,
          line: 5,
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code: 'const a = 1;',
    },
  ],
});
      `,
    },
    {
      code: noFormat`
ruleTester.run({
  valid: [
    {
      code:
noFormat\`
async function foo() {}
async function bar() {}
\`,
    },
  ],
});
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 9,
          line: 6,
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code:
\`
async function foo() {}
async function bar() {}
\`,
    },
  ],
});
      `,
    },
    {
      code: noFormat`
ruleTester.run({
  valid: [
    {
      code:
      noFormat\`
        async function bar() {}
        async function foo() {}
      \`,
    },
  ],
});
      `,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 9,
          line: 6,
          messageId: 'noUnnecessaryNoFormat',
        },
      ],
      output: `
ruleTester.run({
  valid: [
    {
      code:
      \`
        async function bar() {}
        async function foo() {}
      \`,
    },
  ],
});
      `,
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
          column: 13,
          endColumn: 25,
          endLine: 6,
          line: 6,
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
      code: `
ruleTester.run({
  valid: [
    {
      code: 'const x = ";',
    },
  ],
});
      `,
      errors: [
        {
          column: 13,
          data: {
            message: 'Unterminated string literal.',
          },
          endColumn: 27,
          endLine: 5,
          line: 5,
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
          column: 9,
          endColumn: 48,
          endLine: 5,
          line: 5,
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
    `
ruleTester.run({
  valid: [
    {
      code: 'const a = 1;',
    },
  ],
});
    `,
    `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = 1;
      \`,
    },
  ],
});
    `,
    `
ruleTester.run({
  valid: [
    {
      code: \`
const a = 1;
      \`,
    },
  ],
});
    `,
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
      code: `
ruleTester.run({
  valid: [
    {
      code: 'const x=1;',
    },
  ],
});
      `,
      options: [{ formatWithPrettier: false }],
    },

    // empty lines are valid when everything else is indented
    `
ruleTester.run({
  valid: [
    {
      code: \`
        const a = 1;

        const b = 1;
      \`,
    },
  ],
});
    `,

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
