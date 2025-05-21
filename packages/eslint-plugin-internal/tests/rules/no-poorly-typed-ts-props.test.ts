/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-poorly-typed-ts-props';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: getFixturesRootDir(),
    },
  },
});

ruleTester.run('no-poorly-typed-ts-props', rule, {
  invalid: [
    {
      code: `
import ts from 'typescript';
declare const thing: ts.Symbol;
thing.declarations.map(decl => {});
      `,
      errors: [
        {
          data: {
            fixWith: 'getDeclarations()',
            property: 'declarations',
            type: 'Symbol',
          },
          line: 4,
          messageId: 'doNotUseWithFixer',
          suggestions: [
            {
              data: {
                fixWith: 'getDeclarations()',
                type: 'Symbol',
              },
              messageId: 'suggestedFix',
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
          data: {
            fixWith: 'getSymbol()',
            property: 'symbol',
            type: 'Type',
          },
          line: 4,
          messageId: 'doNotUseWithFixer',
          suggestions: [
            {
              data: {
                fixWith: 'getSymbol()',
                type: 'Type',
              },
              messageId: 'suggestedFix',
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
          data: {
            fixWith: 'getSymbol()',
            property: 'symbol',
            type: 'Type',
          },
          line: 4,
          messageId: 'doNotUseWithFixer',
          suggestions: [
            {
              data: {
                fixWith: 'getSymbol()',
                type: 'Type',
              },
              messageId: 'suggestedFix',
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
});
