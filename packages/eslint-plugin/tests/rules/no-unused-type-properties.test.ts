import rule from '../../src/rules/no-unused-type-properties';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unused-type-properties', rule, {
  valid: [
    'function Test() {}',
    'function Test(param) {}',
    'function Test(param: any) {}',
    'function Test(param: string) {}',
    'function Test(param: string[]) {}',
    'function Test(param: { unused: boolean }) {}',
    'function Test({ used }: { used }) {}',
    'function Test({ used1, used2 }: { used1; used2 }) {}',
    'function Test({ used1, used2 }: { used1: boolean }) {}',
    "function Test({ ['used']: renamed }: { used: boolean }) {}",
  ],
  invalid: [
    {
      code: 'function Test({}: { unused: boolean }) {}',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: `function Test({}: {  }) {}`,
    },
    {
      code: 'function Test({ used }: { unused: boolean; used: boolean }) {}',
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: `function Test({ used }: {  used: boolean }) {}`,
    },
    {
      code: "function Test({ ['used']: renamed }: { unused: boolean; used: boolean }) {}",
      errors: [
        {
          column: 40,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: `function Test({ ['used']: renamed }: {  used: boolean }) {}`,
    },
  ],
});
