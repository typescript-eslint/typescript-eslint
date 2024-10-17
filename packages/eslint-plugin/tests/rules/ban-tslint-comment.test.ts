import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/ban-tslint-comment';

interface Testable {
  code: string;
  column?: number;
  line?: number;
  output?: string;
  text?: string;
}

const PALANTIR_EXAMPLES: Testable[] = [
  { code: '/* tslint:disable */' }, // Disable all rules for the rest of the file
  { code: '/* tslint:enable */' }, // Enable all rules for the rest of the file
  {
    code: '/* tslint:disable:rule1 rule2 rule3... */',
  }, // Disable the listed rules for the rest of the file
  {
    code: '/* tslint:enable:rule1 rule2 rule3... */',
  }, // Enable the listed rules for the rest of the file
  { code: '// tslint:disable-next-line' }, // Disables all rules for the following line
  {
    code: 'someCode(); // tslint:disable-line',
    column: 13,
    output: 'someCode();',
    text: '// tslint:disable-line',
  }, // Disables all rules for the current line
  {
    code: '// tslint:disable-next-line:rule1 rule2 rule3...',
  }, // Disables the listed rules for the next line
];

// prettier-ignore
const MORE_EXAMPLES: Testable[] = [
  {
    code: `const woah = doSomeStuff();
// tslint:disable-line
console.log(woah);
`,
    line: 2,
    output: `const woah = doSomeStuff();
console.log(woah);
`,
    text: '// tslint:disable-line',
  },
]

const ruleTester = new RuleTester();

ruleTester.run('ban-tslint-comment', rule, {
  valid: [
    {
      code: 'let a: readonly any[] = [];',
    },
    {
      code: 'let a = new Array();',
    },
    {
      code: '// some other comment',
    },
    {
      code: '// TODO: this is a comment that mentions tslint',
    },
    {
      code: '/* another comment that mentions tslint */',
    },
  ],
  invalid: [...PALANTIR_EXAMPLES, ...MORE_EXAMPLES].map(
    ({ code, column, line, output, text }) => ({
      code,
      errors: [
        {
          column: column ?? 1,
          data: { text: text ?? code },
          line: line ?? 1,
          messageId: 'commentDetected' as const,
        },
      ],
      output: output ?? '',
    }),
  ),
});
