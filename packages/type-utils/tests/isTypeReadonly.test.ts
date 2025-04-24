import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';
import type { TestContext } from 'vitest';

import { parseForESLint } from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import path from 'node:path';

import type { ReadonlynessOptions } from '../src/isTypeReadonly';

import { isTypeReadonly } from '../src/isTypeReadonly';
import { expectToHaveParserServices } from './test-utils/expectToHaveParserServices';

describe(isTypeReadonly, () => {
  const rootDir = path.join(__dirname, 'fixtures');

  describe(AST_NODE_TYPES.TSTypeAliasDeclaration, () => {
    function getType(code: string): {
      program: ts.Program;
      type: ts.Type;
    } {
      const { ast, services } = parseForESLint(code, {
        disallowAutomaticSingleRunInference: true,
        filePath: path.join(rootDir, 'file.ts'),
        project: './tsconfig.json',
        tsconfigRootDir: rootDir,
      });
      expectToHaveParserServices(services);
      const { esTreeNodeToTSNodeMap, program } = services;

      const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;
      return {
        program,
        type: program
          .getTypeChecker()
          .getTypeAtLocation(esTreeNodeToTSNodeMap.get(declaration.id)),
      };
    }

    function runTestForAliasDeclaration(
      code: string,
      options: ReadonlynessOptions | undefined,
      expected: boolean,
      { expect }: TestContext,
    ): void {
      const { program, type } = getType(code);

      const result = isTypeReadonly(program, type, options);
      expect(result).toBe(expected);
    }

    describe('default options', () => {
      const options = undefined;

      function runTestIsReadonly(
        [code]: readonly [code: string],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, options, true, testContext);
      }

      function runTestIsNotReadonly(
        [code]: readonly [code: string],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, options, false, testContext);
      }

      describe('basics', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          // Record.
          it.for([
            ['type Test = { readonly bar: string; };'],
            ['type Test = Readonly<{ bar: string; }>;'],
          ] as const)('handles fully readonly records', runTests);

          // Array.
          it.for([
            ['type Test = Readonly<readonly string[]>;'],
            ['type Test = Readonly<ReadonlyArray<string>>;'],
          ] as const)('handles fully readonly arrays', runTests);

          // Array - special case.
          // Note: Methods are mutable but arrays are treated special; hence no failure.
          it.for([
            ['type Test = readonly string[];'],
            ['type Test = ReadonlyArray<string>;'],
          ] as const)('treats readonly arrays as fully readonly', runTests);

          // Set and Map.
          it.for([
            ['type Test = Readonly<ReadonlySet<string>>;'],
            ['type Test = Readonly<ReadonlyMap<string, string>>;'],
          ] as const)('handles fully readonly sets and maps', runTests);

          // Private Identifier.
          // Note: It can't be accessed from outside of class thus exempt from the checks.
          it.for([
            ['class Foo { readonly #readonlyPrivateField = "foo"; }'],
            ['class Foo { #privateField = "foo"; }'],
            ['class Foo { #privateMember() {}; }'],
          ] as const)('treat private identifier as readonly', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          // Record.
          it.for([
            ['type Test = { foo: string; };'],
            ['type Test = { foo: string; readonly bar: number; };'],
          ] as const)('handles non fully readonly records', runTests);

          // Array.
          it.for([
            ['type Test = string[]'],
            ['type Test = Array<string>'],
          ] as const)('handles non fully readonly arrays', runTests);

          // Set and Map.
          // Note: Methods are mutable for ReadonlySet and ReadonlyMet; hence failure.
          it.for([
            ['type Test = Set<string>;'],
            ['type Test = Map<string, string>;'],
            ['type Test = ReadonlySet<string>;'],
            ['type Test = ReadonlyMap<string, string>;'],
          ] as const)('handles non fully readonly sets and maps', runTests);
        });
      });

      describe('IndexSignature', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.for([
            ['type Test = { readonly [key: string]: string };'],
            [
              'type Test = { readonly [key: string]: { readonly foo: readonly string[]; }; };',
            ],
          ] as const)(
            'handles readonly PropertySignature inside a readonly IndexSignature',
            runTests,
          );
        });

        describe('is readonly circular', () => {
          const runTests = runTestIsReadonly;

          it('handles circular readonly PropertySignature inside a readonly IndexSignature', testContext => {
            runTests(
              ['interface Test { readonly [key: string]: Test };'],
              testContext,
            );
          });

          it('handles circular readonly PropertySignature inside interdependent objects', testContext => {
            runTests(
              [
                'interface Test1 { readonly [key: string]: Test } interface Test { readonly [key: string]: Test1 }',
              ],
              testContext,
            );
          });
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.for([
            ['type Test = { [key: string]: string };'],
            ['type Test = { readonly [key: string]: { foo: string[]; }; };'],
          ] as const)(
            'handles mutable PropertySignature inside a readonly IndexSignature',
            runTests,
          );
        });

        describe('is not readonly circular', () => {
          const runTests = runTestIsNotReadonly;

          it('handles circular mutable PropertySignature', testContext => {
            runTests(['interface Test { [key: string]: Test };'], testContext);
          });

          it.for([
            [
              'interface Test1 { [key: string]: Test } interface Test { readonly [key: string]: Test1 }',
            ],
            [
              'interface Test1 { readonly [key: string]: Test } interface Test { [key: string]: Test1 }',
            ],
            [
              'interface Test1 { [key: string]: Test } interface Test { [key: string]: Test1 }',
            ],
          ] as const)(
            'handles circular mutable PropertySignature inside interdependent objects',
            runTests,
          );
        });
      });

      describe('Union', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.for([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & Readonly<{ bar: number; }>;',
            ],
            ['type Test = readonly string[] | readonly number[];'],
          ] as const)('handles a union of 2 fully readonly types', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.for([
            ['type Test = { foo: string; bar: number; } | { bar: number; };'],
            [
              'type Test = { foo: string; bar: number; } | Readonly<{ bar: number; }>;',
            ],
            [
              'type Test = Readonly<{ foo: string; bar: number; }> | { bar: number; };',
            ],
          ] as const)('handles a union of non fully readonly types', runTests);
        });
      });

      describe('Intersection', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.for([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & Readonly<{ bar: number; }>;',
            ],
          ] as const)(
            'handles an intersection of 2 fully readonly types',
            runTests,
          );

          it.for([
            [
              'type Test = Readonly<{ foo: string; bar: number; }> & { foo: string; };',
            ],
          ] as const)(
            'handles an intersection of a fully readonly type with a mutable subtype',
            runTests,
          );

          // Array - special case.
          // Note: Methods are mutable but arrays are treated special; hence no failure.
          it.for([
            ['type Test = ReadonlyArray<string> & Readonly<{ foo: string; }>;'],
            [
              'type Test = readonly [string, number] & Readonly<{ foo: string; }>;',
            ],
          ] as const)(
            'handles an intersections involving a readonly array',
            runTests,
          );
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.for([
            ['type Test = { foo: string; bar: number; } & { bar: number; };'],
            [
              'type Test = { foo: string; bar: number; } & Readonly<{ bar: number; }>;',
            ],
            [
              'type Test = Readonly<{ bar: number; }> & { foo: string; bar: number; };',
            ],
          ] as const)(
            'handles an intersection of non fully readonly types',
            runTests,
          );
        });
      });

      describe('Conditional Types', () => {
        describe('is readonly', () => {
          const runTests = runTestIsReadonly;

          it.for([
            [
              'type Test<T> = T extends readonly number[] ? readonly string[] : readonly number[];',
            ],
          ] as const)(
            'handles conditional type that are fully readonly',
            runTests,
          );

          it.for([
            [
              'type Test<T> = T extends number[] ? readonly string[] : readonly number[];',
            ],
          ] as const)('should ignore mutable conditions', runTests);
        });

        describe('is not readonly', () => {
          const runTests = runTestIsNotReadonly;

          it.for([
            ['type Test<T> = T extends number[] ? string[] : number[];'],
            [
              'type Test<T> = T extends number[] ? string[] : readonly number[];',
            ],
            [
              'type Test<T> = T extends number[] ? readonly string[] : number[];',
            ],
          ] as const)('handles non fully readonly conditional types', runTests);
        });
      });
    });

    describe('treatMethodsAsReadonly', () => {
      const options: ReadonlynessOptions = {
        treatMethodsAsReadonly: true,
      };

      function runTestIsReadonly(
        [code]: readonly [code: string],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, options, true, testContext);
      }

      // function runTestIsNotReadonly(code: string): void {
      //   runTestForAliasDeclaration(code, options, false);
      // }

      describe('is readonly', () => {
        const runTests = runTestIsReadonly;

        // Set and Map.
        it.for([
          ['type Test = ReadonlySet<string>;'],
          ['type Test = ReadonlyMap<string, string>;'],
        ] as const)('handles non fully readonly sets and maps', runTests);
      });
    });

    describe('allowlist', () => {
      const options: ReadonlynessOptions = {
        allow: [
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

      function runTestIsReadonly(
        [code]: readonly [code: string],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, options, true, testContext);
      }

      function runTestIsNotReadonly(
        [code]: readonly [code: string],
        testContext: TestContext,
      ): void {
        runTestForAliasDeclaration(code, options, false, testContext);
      }

      describe('is readonly', () => {
        it.for([
          [
            'interface Foo {readonly prop: RegExp}; type Test = (arg: Foo) => void;',
          ],
          [
            'interface Foo {prop: RegExp}; type Test = (arg: Readonly<Foo>) => void;',
          ],
          ['interface Foo {prop: string}; type Test = (arg: Foo) => void;'],
        ] as const)(
          'correctly marks allowlisted types as readonly',
          runTestIsReadonly,
        );
      });

      describe('is not readonly', () => {
        it.for([
          [
            'interface Bar {prop: RegExp}; type Test = (arg: Readonly<Bar>) => void;',
          ],
          ['interface Bar {prop: string}; type Test = (arg: Bar) => void;'],
        ] as const)(
          'correctly marks allowlisted types as readonly',
          runTestIsNotReadonly,
        );
      });
    });
  });
});
