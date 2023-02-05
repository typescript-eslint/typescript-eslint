import { parseForESLint } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/utils';
import path from 'path';
import type * as ts from 'typescript';

import {
  isTypeReadonly,
  type ReadonlynessOptions,
} from '../src/isTypeReadonly';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

describe('isTypeReadonly', () => {
  const rootDir = path.join(__dirname, 'fixtures');

  describe('TSTypeAliasDeclaration ', () => {
    function getType(code: string): {
      type: ts.Type;
      program: ts.Program;
    } {
      const { ast, services } = parseForESLint(code, {
        project: './tsconfig.json',
        filePath: path.join(rootDir, 'file.ts'),
        tsconfigRootDir: rootDir,
      });
      expectToHaveParserServices(services);
      const program = services.program;
      const esTreeNodeToTSNodeMap = services.esTreeNodeToTSNodeMap;

      const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;
      return {
        type: program
          .getTypeChecker()
          .getTypeAtLocation(esTreeNodeToTSNodeMap.get(declaration.id)),
        program,
      };
    }

    function runTestForAliasDeclaration(
      code: string,
      options: ReadonlynessOptions | undefined,
      expected: boolean,
    ): void {
      const { type, program } = getType(code);

      const result = isTypeReadonly(program, type, options);
      expect(result).toBe(expected);
    }

    describe('default options', () => {
      const options = undefined;

      function runTestIsReadonly(code: string): void {
        runTestForAliasDeclaration(code, options, true);
      }

      function runTestIsNotReadonly(code: string): void {
        runTestForAliasDeclaration(code, options, false);
      }

      describe('basics', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          // Record.
          it.each([
            ['type Test = { readonly bar: string; };'],
            ['type Test = Readonly<{ bar: string; }>;'],
          ])('handles fully readonly records', runTests);

          // Array.
          it.each([
            ['type Test = Readonly<readonly string[]>;'],
            ['type Test = Readonly<ReadonlyArray<string>>;'],
          ])('handles fully readonly arrays', runTests);

          // Array - special case.
          // Note: Methods are mutable but arrays are treated special; hence no failure.
          it.each([
            ['type Test = readonly string[];'],
            ['type Test = ReadonlyArray<string>;'],
          ])('treats readonly arrays as fully readonly', runTests);

          // Set and Map.
          it.each([
            ['type Test = Readonly<ReadonlySet<string>>;'],
            ['type Test = Readonly<ReadonlyMap<string, string>>;'],
          ])('handles fully readonly sets and maps', runTests);

          // Private Identifier.
          // Note: It can't be accessed from outside of class thus exempt from the checks.
          it.each([
            ['class Foo { readonly #readonlyPrivateField = "foo"; }'],
            ['class Foo { #privateField = "foo"; }'],
            ['class Foo { #privateMember() {}; }'],
          ])('treat private identifier as readonly', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          // Record.
          it.each([
            ['type Test = { foo: string; };'],
            ['type Test = { foo: string; readonly bar: number; };'],
          ])('handles non fully readonly records', runTests);

          // Array.
          it.each([['type Test = string[]'], ['type Test = Array<string>']])(
            'handles non fully readonly arrays',
            runTests,
          );

          // Set and Map.
          // Note: Methods are mutable for ReadonlySet and ReadonlyMet; hence failure.
          it.each([
            ['type Test = Set<string>;'],
            ['type Test = Map<string, string>;'],
            ['type Test = ReadonlySet<string>;'],
            ['type Test = ReadonlyMap<string, string>;'],
          ])('handles non fully readonly sets and maps', runTests);
        });
      });

      describe('IndexSignature', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.each([
            ['type Test = { readonly [key: string]: string };'],
            [
              'type Test = { readonly [key: string]: { readonly foo: readonly string[]; }; };',
            ],
          ])(
            'handles readonly PropertySignature inside a readonly IndexSignature',
            runTests,
          );
        });

        describe('is readonly circular', () => {
          const runTests = runTestIsReadonly;

          it('handles circular readonly PropertySignature inside a readonly IndexSignature', () =>
            runTests('interface Test { readonly [key: string]: Test };'));

          it('handles circular readonly PropertySignature inside interdependent objects', () =>
            runTests(
              'interface Test1 { readonly [key: string]: Test } interface Test { readonly [key: string]: Test1 }',
            ));
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.each([
            ['type Test = { [key: string]: string };'],
            ['type Test = { readonly [key: string]: { foo: string[]; }; };'],
          ])(
            'handles mutable PropertySignature inside a readonly IndexSignature',
            runTests,
          );
        });

        describe('is not readonly circular', () => {
          const runTests = runTestIsNotReadonly;

          it('handles circular mutable PropertySignature', () =>
            runTests('interface Test { [key: string]: Test };'));

          it.each([
            [
              'interface Test1 { [key: string]: Test } interface Test { readonly [key: string]: Test1 }',
            ],
            [
              'interface Test1 { readonly [key: string]: Test } interface Test { [key: string]: Test1 }',
            ],
            [
              'interface Test1 { [key: string]: Test } interface Test { [key: string]: Test1 }',
            ],
          ])(
            'handles circular mutable PropertySignature inside interdependent objects',
            runTests,
          );
        });
      });

      describe('Union', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.each([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & Readonly<{ bar: number; }>;',
            ],
            ['type Test = readonly string[] | readonly number[];'],
          ])('handles a union of 2 fully readonly types', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.each([
            ['type Test = { foo: string; bar: number; } | { bar: number; };'],
            [
              'type Test = { foo: string; bar: number; } | Readonly<{ bar: number; }>;',
            ],
            [
              'type Test = Readonly<{ foo: string; bar: number; }> | { bar: number; };',
            ],
          ])('handles a union of non fully readonly types', runTests);
        });
      });

      describe('Intersection', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.each([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & Readonly<{ bar: number; }>;',
            ],
          ])('handles an intersection of 2 fully readonly types', runTests);

          it.each([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & { foo: string; };',
            ],
          ])(
            'handles an intersection of a fully readonly type with a mutable subtype',
            runTests,
          );

          // Array - special case.
          // Note: Methods are mutable but arrays are treated special; hence no failure.
          it.each([
            ['type Test = ReadonlyArray<string> & Readonly<{ foo: string; }>;'],
            [
              'type Test = readonly [string, number] & Readonly<{ foo: string; }>;',
            ],
          ])('handles an intersections involving a readonly array', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.each([
            ['type Test = { foo: string; bar: number; } & { bar: number; };'],
            [
              'type Test = { foo: string; bar: number; } & Readonly<{ bar: number; }>;',
            ],
            [
              'type Test = Readonly<{ bar: number; }> & { foo: string; bar: number; };',
            ],
          ])('handles an intersection of non fully readonly types', runTests);
        });
      });

      describe('Conditional Types', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.each([
            [
              'type Test<T> = T extends readonly number[] ? readonly string[] : readonly number[];',
            ],
          ])('handles conditional type that are fully readonly', runTests);

          it.each([
            [
              'type Test<T> = T extends number[] ? readonly string[] : readonly number[];',
            ],
          ])('should ignore mutable conditions', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.each([
            ['type Test<T> = T extends number[] ? string[] : number[];'],
            [
              'type Test<T> = T extends number[] ? string[] : readonly number[];',
            ],
            [
              'type Test<T> = T extends number[] ? readonly string[] : number[];',
            ],
          ])('handles non fully readonly conditional types', runTests);
        });
      });
    });

    describe('treatMethodsAsReadonly', () => {
      const options: ReadonlynessOptions = {
        treatMethodsAsReadonly: true,
      };

      function runTestIsReadonly(code: string): void {
        runTestForAliasDeclaration(code, options, true);
      }

      // function runTestIsNotReadonly(code: string): void {
      //   runTestForAliasDeclaration(code, options, false);
      // }

      describe('is readonly', () => {
        const runTests = runTestIsReadonly;

        // Set and Map.
        it.each([
          ['type Test = ReadonlySet<string>;'],
          ['type Test = ReadonlyMap<string, string>;'],
        ])('handles non fully readonly sets and maps', runTests);
      });
    });

    describe('allowlist', () => {
      const options: ReadonlynessOptions = {
        allowlist: [
          {
            from: 'lib',
            name: 'RegExp',
          },
          {
            from: 'file',
            name: 'Foo',
          },
        ],
      };

      function runTestIsReadonly(code: string): void {
        runTestForAliasDeclaration(code, options, true);
      }

      describe('is readonly', () => {
        const runTests = runTestIsReadonly;

        it.each([
          [
            'interface Bar {readonly prop: RegExp}; type Test = (arg: Bar) => void;',
          ],
          ['interface Foo {prop: string}; type Test = (arg: Foo) => void;'],
        ])('correctly marks allowlisted types as readonly', runTests);
      });
    });
  });
});
