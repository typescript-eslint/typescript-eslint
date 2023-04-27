/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-poorly-typed-ts-props';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
    sourceType: 'module',
  },
});

ruleTester.run('no-poorly-typed-ts-props', rule, {
  valid: [
    `
declare const foo: { declarations: string[] };
foo.declarations.map(decl => console.log(decl));
    `,
    `
declare const bar: Symbol;
bar.declarations.map(decl => console.log(decl));
    `,
    `
declare const baz: Type;
baz.symbol.name;
    `,
  ],
  invalid: [
    {
      code: `
import ts from 'typescript';
declare const thing: ts.Symbol;
thing.declarations.map(decl => {});
      `,
      errors: [
        {
          messageId: 'doNotUseWithFixer',
          data: {
            type: 'Symbol',
            property: 'declarations',
            fixWith: 'getDeclarations()',
          },
          line: 4,
          suggestions: [
            {
              messageId: 'suggestedFix',
              data: {
                type: 'Symbol',
                fixWith: 'getDeclarations()',
              },
              output: `
import ts from 'typescript';
declare const thing: ts.Symbol;
thing.getDeclarations().map(decl => {});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
import ts from 'typescript';
declare const thing: ts.Type;
thing.symbol;
      `,
      errors: [
        {
          messageId: 'doNotUseWithFixer',
          data: {
            type: 'Type',
            property: 'symbol',
            fixWith: 'getSymbol()',
          },
          line: 4,
          suggestions: [
            {
              messageId: 'suggestedFix',
              data: {
                type: 'Type',
                fixWith: 'getSymbol()',
              },
              output: `
import ts from 'typescript';
declare const thing: ts.Type;
thing.getSymbol();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
import ts from 'typescript';
declare const thing: ts.Type;
thing?.symbol;
      `,
      errors: [
        {
          messageId: 'doNotUseWithFixer',
          data: {
            type: 'Type',
            property: 'symbol',
            fixWith: 'getSymbol()',
          },
          line: 4,
          suggestions: [
            {
              messageId: 'suggestedFix',
              data: {
                type: 'Type',
                fixWith: 'getSymbol()',
              },
              output: `
import ts from 'typescript';
declare const thing: ts.Type;
thing?.getSymbol();
      `,
            },
          ],
        },
      ],
    },
  ],
});
