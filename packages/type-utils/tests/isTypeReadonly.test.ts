import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';
import { parseForESLint } from '@typescript-eslint/parser';
import {
  isTypeReadonly,
  type ReadonlynessOptions,
} from '../src/isTypeReadonly';
import path from 'path';

describe('isTypeReadonly', () => {
  const rootDir = path.join(__dirname, 'fixtures');

  describe('TSTypeAliasDeclaration ', () => {
    function getType(code: string): {
      type: ts.Type;
      checker: ts.TypeChecker;
    } {
      const { ast, services } = parseForESLint(code, {
        project: './tsconfig.json',
        filePath: path.join(rootDir, 'file.ts'),
        tsconfigRootDir: rootDir,
      });
      const checker = services.program.getTypeChecker();
      const esTreeNodeToTSNodeMap = services.esTreeNodeToTSNodeMap;

      const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;
      return {
        type: checker.getTypeAtLocation(
          esTreeNodeToTSNodeMap.get(declaration.id),
        ),
        checker,
      };
    }

    function runTestForAliasDeclaration(
      code: string,
      options: ReadonlynessOptions | undefined,
      expected: boolean,
    ): void {
      const { type, checker } = getType(code);

      const result = isTypeReadonly(checker, type, options);
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
  });
});
