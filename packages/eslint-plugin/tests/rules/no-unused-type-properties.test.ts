import rule from '../../src/rules/no-unused-type-properties';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
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
    "function Test({ ['used']: renamed }: { [i: string]: number }) {}",
    'function Test({ included, used }: { used: boolean; [i: string]: boolean }) {}',
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
    {
      code: `
        function Test({ }: { [i: string]: boolean }) {}
      `,
      errors: [
        {
          data: { term: 'index signature' },
          column: 30,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
        function Test({ }: {  }) {}
      `,
    },
    {
      code: `
        function Test({ used }: { used: boolean; [i: string]: boolean }) {}
      `,
      errors: [
        {
          data: { term: 'index signature' },
          column: 50,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
        function Test({ used }: { used: boolean;  }) {}
      `,
    },
    {
      code: `
        function Test({ used }: { used: boolean; [i: number]: boolean }) {}
      `,
      errors: [
        {
          data: { term: 'index signature' },
          column: 50,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
        function Test({ used }: { used: boolean;  }) {}
      `,
    },
    {
      code: `
        function Test({ used }: { [i: number]: boolean; [i: string]: boolean; }) {}
      `,
      errors: [
        {
          data: { term: 'index signature' },
          column: 50,
          line: 2,
          messageId: 'unused',
        },
      ],
      only: true,
      output: `
        function Test({ used }: { [i: number]: boolean;  }) {}
      `,
    },
    {
      code: `
        function Test({ used }: { used: boolean; [i: number]: boolean; [i: string]: boolean; }) {}
      `,
      errors: [
        {
          data: { term: 'index signature' },
          column: 50,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
        function Test({ used }: { used: boolean;  }) {}
      `,
    },
    // todo:
    /*
      const key = 'abc';

      function Test(
        { [key]: renamed, }:
          { [i: number]: boolean; [i: string]: boolean | string; }
      ) { }
    */
    // todo: number and string index signatures
    // todo: template literal index key, matching and unmatching
    // todo: symbol keys
  ],
});
