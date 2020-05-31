import rule from '../../src/rules/ban-tslint-comment';
import { RuleTester } from '../RuleTester';

interface Testable {
  code: string;
  text?: string;
  column?: number;
  line?: number;
  output?: string;
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
    text: '// tslint:disable-line',
    column: 13,
    output: 'someCode();',
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
    output: `const woah = doSomeStuff();
console.log(woah);
`,
    text: '// tslint:disable-line',
    line: 2,
  },
]

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
      output: output ?? '',
      errors: [
        {
          column: column ?? 1,
          line: line ?? 1,
          data: { text: text ?? code },
          messageId: 'commentDetected' as const,
        },
      ],
    }),
  ),
});
