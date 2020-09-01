import rule from '../../src/rules/no-poorly-typed-ts-props';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

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
      `.trimRight(),
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
              `.trimRight(),
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
      `.trimRight(),
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
              `.trimRight(),
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
      `.trimRight(),
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
              `.trimRight(),
            },
          ],
        },
      ],
    },
  ],
});
