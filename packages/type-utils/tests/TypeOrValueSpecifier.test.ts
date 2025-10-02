import type { TSESTree } from '@typescript-eslint/utils';

import { parseForESLint } from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as path from 'node:path';

import type { TypeOrValueSpecifier } from '../src/index.js';

import {
  typeMatchesSomeSpecifier,
  typeMatchesSpecifier,
  valueMatchesSomeSpecifier,
  valueMatchesSpecifier,
} from '../src/index.js';

const ROOT_DIR = path.posix.join(
  ...path.relative(process.cwd(), path.join(__dirname, '..')).split(path.sep),
);

describe('TypeOrValueSpecifier', () => {
  describe('Schema', () => {
    it.for([['MyType'], ['myValue'], ['any'], ['void'], ['never']] as const)(
      'matches a simple string specifier: %s',
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).toBeValidSpecifier();
      },
    );

    it.for([
      [42],
      [false],
      [null],
      [undefined],
      [['MyType']],
      [(): void => {}],
    ] as const)(
      "doesn't match any non-string basic type: %s",
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).not.toBeValidSpecifier();
      },
    );

    it.for([
      [{ from: 'file', name: 'MyType' }],
      [{ from: 'file', name: ['MyType', 'myValue'] }],
      [{ from: 'file', name: 'MyType', path: './filename.js' }],
      [{ from: 'file', name: ['MyType', 'myValue'], path: './filename.js' }],
    ] as const)(
      'matches a file specifier: %s',
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).toBeValidSpecifier();
      },
    );

    it.for([
      [{ from: 'file', name: 42 }],
      [{ from: 'file', name: ['MyType', 42] }],
      [{ from: 'file', name: ['MyType', 'MyType'] }],
      [{ from: 'file', name: [] }],
      [{ from: 'file', path: `${ROOT_DIR}/filename.js` }],
      [{ from: 'file', name: 'MyType', path: 42 }],
      [
        {
          from: 'file',
          name: ['MyType', 'MyType'],
          path: `${ROOT_DIR}/filename.js`,
        },
      ],
      [{ from: 'file', name: [], path: `${ROOT_DIR}/filename.js` }],
      [
        {
          from: 'file',
          name: ['MyType', 'myValue'],
          path: [`${ROOT_DIR}/filename.js`, `${ROOT_DIR}/another-file.js`],
        },
      ],
      [{ from: 'file', name: 'MyType', unrelatedProperty: '' }],
    ] as const)(
      "doesn't match a malformed file specifier: %s",
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).not.toBeValidSpecifier();
      },
    );

    it.for([
      [{ from: 'lib', name: 'MyType' }],
      [{ from: 'lib', name: ['MyType', 'myValue'] }],
    ] as const)(
      'matches a lib specifier: %s',
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).toBeValidSpecifier();
      },
    );

    it.for([
      [{ from: 'lib', name: 42 }],
      [{ from: 'lib', name: ['MyType', 42] }],
      [{ from: 'lib', name: ['MyType', 'MyType'] }],
      [{ from: 'lib', name: [] }],
      [{ from: 'lib' }],
      [{ from: 'lib', name: 'MyType', unrelatedProperty: '' }],
    ] as const)(
      "doesn't match a malformed lib specifier: %s",
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).not.toBeValidSpecifier();
      },
    );

    it.for([
      [{ from: 'package', name: 'MyType', package: 'jquery' }],
      [
        {
          from: 'package',
          name: ['MyType', 'myValue'],
          package: 'jquery',
        },
      ],
    ] as const)(
      'matches a package specifier: %s',
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).toBeValidSpecifier();
      },
    );

    it.for([
      [{ from: 'package', name: 42, package: 'jquery' }],
      [{ from: 'package', name: ['MyType', 42], package: 'jquery' }],
      [
        {
          from: 'package',
          name: ['MyType', 'MyType'],
          package: 'jquery',
        },
      ],
      [{ from: 'package', name: [], package: 'jquery' }],
      [{ from: 'package', name: 'MyType' }],
      [{ from: 'package', package: 'jquery' }],
      [{ from: 'package', name: 'MyType', package: 42 }],
      [{ from: [], name: 'MyType' }],
      [{ from: ['file'], name: 'MyType' }],
      [{ from: ['lib'], name: 'MyType' }],
      [{ from: ['package'], name: 'MyType' }],
      [
        {
          from: 'package',
          name: ['MyType', 'myValue'],
          package: ['jquery', `${ROOT_DIR}/another-file.js`],
        },
      ],
      [
        {
          from: 'package',
          name: 'MyType',
          package: 'jquery',
          unrelatedProperty: '',
        },
      ],
    ] as const)(
      "doesn't match a malformed package specifier: %s",
      ([typeOrValueSpecifier], { expect }) => {
        expect([typeOrValueSpecifier]).not.toBeValidSpecifier();
      },
    );
  });

  describe(typeMatchesSpecifier, () => {
    it.for([
      ['interface Foo {prop: string}; type Test = Foo;', 'Foo'],
      ['type Test = RegExp;', 'RegExp'],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching universal string specifier: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      ['interface Foo {prop: string}; type Test = Foo;', 'Bar'],
      ['interface Foo {prop: string}; type Test = Foo;', 'RegExp'],
      ['type Test = RegExp;', 'Foo'],
      ['type Test = RegExp;', 'BigInt'],
      ['type Test = RegExp | BigInt;', 'BigInt'],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched universal string specifier: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Foo' },
      ],
      [
        'type Foo = {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Foo' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: ['Foo', 'Bar'] },
      ],
      [
        'type Foo = {prop: string}; type Test = Foo;',
        { from: 'file', name: ['Foo', 'Bar'] },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: 'Foo',
          path: `${ROOT_DIR}/tests/fixtures/file.ts`,
        },
      ],
      [
        'type Foo = {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: 'Foo',
          path: `${ROOT_DIR}/tests/fixtures/file.ts`,
        },
      ],
      [
        'type Foo = Promise<number> & {hey?: string}; let foo: Foo = Promise.resolve(5); type Test = typeof foo;',
        { from: 'file', name: 'Foo' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: 'Foo',
          path: `${ROOT_DIR}/tests/../tests/fixtures/////file.ts`,
        },
      ],
      [
        'type Foo = {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: 'Foo',
          path: `${ROOT_DIR}/tests/../tests/fixtures/////file.ts`,
        },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          path: `${ROOT_DIR}/tests/fixtures/file.ts`,
        },
      ],
      [
        'type Foo = {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          path: `${ROOT_DIR}/tests/fixtures/file.ts`,
        },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching file specifier: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Bar' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo | string;',
        { from: 'file', name: 'Foo' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: ['Bar', 'Baz'] },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: 'Foo',
          path: `${ROOT_DIR}/tests/fixtures/wrong-file.ts`,
        },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          path: `${ROOT_DIR}/tests/fixtures/wrong-file.ts`,
        },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched file specifier: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      ['type Test = RegExp;', { from: 'lib', name: 'RegExp' }],
      ['type Test = RegExp;', { from: 'lib', name: ['RegExp', 'BigInt'] }],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching lib specifier: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      ['type Test = RegExp;', { from: 'lib', name: 'BigInt' }],
      ['type Test = RegExp | BigInt;', { from: 'lib', name: 'BigInt' }],
      ['type Test = RegExp;', { from: 'lib', name: ['BigInt', 'Date'] }],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched lib specifier: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      ['type Test = string;', { from: 'lib', name: 'string' }],
      ['type Test = string;', { from: 'lib', name: ['string', 'number'] }],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching intrinsic type specifier: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      ['type Test = string;', { from: 'lib', name: 'number' }],
      ['type Test = string | number;', { from: 'lib', name: 'number' }],
      ['type Test = string;', { from: 'lib', name: ['number', 'boolean'] }],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched intrinsic type specifier: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        'import type {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import type {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: ['Node', 'Symbol'], package: 'typescript' },
      ],
      [
        'import {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: ['Node', 'Symbol'], package: 'typescript' },
      ],
      [
        'import * as ts from "typescript"; type Test = ts.Node;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import * as ts from "typescript"; type Test = ts.Node;',
        { from: 'package', name: ['Node', 'Symbol'], package: 'typescript' },
      ],
      [
        'import type * as ts from "typescript"; type Test = ts.Node;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import type * as ts from "typescript"; type Test = ts.Node;',
        { from: 'package', name: ['Node', 'Symbol'], package: 'typescript' },
      ],
      [
        'import type {Node as TsNode} from "typescript"; type Test = TsNode;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import type {Node as TsNode} from "typescript"; type Test = TsNode;',
        { from: 'package', name: ['Node', 'Symbol'], package: 'typescript' },
      ],
      // The following type is available from the @types/semver package.
      [
        'import {SemVer} from "semver"; type Test = SemVer;',
        { from: 'package', name: 'SemVer', package: 'semver' },
      ],
      // The following type is available from the scoped @types/babel__code-frame package.
      [
        'import {BabelCodeFrameOptions} from "@babel/code-frame"; type Test = BabelCodeFrameOptions;',
        {
          from: 'package',
          name: 'BabelCodeFrameOptions',
          package: '@babel/code-frame',
        },
      ],
      // TODO: Skipped pending resolution of https://github.com/typescript-eslint/typescript-eslint/issues/11504
      //
      // The following type is available from the multi-file @types/node package.
      // [
      //   'import { it } from "node:test"; type Test = typeof it;',
      //   {
      //     from: 'package',
      //     name: 'it',
      //     package: 'node:test',
      //   },
      // ],
      // [
      //   `
      //     declare module "node:test" {
      //       export function it(): void;
      //     }
      //
      //     import { it } from "node:test";
      //
      //     type Test = typeof it;
      //   `,
      //   {
      //     from: 'package',
      //     name: 'it',
      //     package: 'node:test',
      //   },
      // ],
      [
        'import { fail } from "node:assert"; type Test = typeof fail;',
        {
          from: 'package',
          name: 'fail',
          package: 'assert',
        },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching package specifier: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        `
          type Other = { __otherBrand: true };
          type SafePromise = Promise<number> & { __safeBrand: string };
          type JoinedPromise = SafePromise & {};
        `,
        { from: 'file', name: ['Other'] },
      ],
      // The SafePromise alias acts as an actual alias ("cut-and-paste"). I.e.:
      // type JoinedPromise = Promise<number> & { __safeBrand: string };
      [
        `
          type SafePromise = Promise<number> & { __safeBrand: string };
          type JoinedPromise = SafePromise & {};
        `,
        { from: 'file', name: ['SafePromise'] },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched type specifier for an intersection type: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        `
          type SafePromise = Promise<number> & { __safeBrand: string };
          type ResultType = { foo: 'bar' };
          type Test = SafePromise & ResultType;
        `,
        { from: 'file', name: ['ResultType'] },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching type specifier for an intersection type: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        `
          declare module "node:test" {
            type SafePromise = Promise<undefined> & { __safeBrand: string };
            type ItResult = { foo: 'bar' };

            export function it(): SafePromise & ItResult;
          }

          import { it } from "node:test";

          type Test = ReturnType<typeof it>;
        `,
        {
          from: 'package',
          name: ['ItResult'],
          package: 'node:test',
        },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      'matches a matching package specifier for an intersection type: %s\n\t%s',
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        `
          declare module "node:test" {
            type SafePromise = Promise<undefined> & { __safeBrand: string };
            type ItResult = { foo: 'bar' };

            export function it(): SafePromise & ItResult;
          }

          import { it } from "node:test";

          type Test = ReturnType<typeof it>;
        `,
        {
          from: 'package',
          name: ['Result'],
          package: 'node:test',
        },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched package specifier for an intersection type: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it("does not match a `declare global` with the 'global' package name", () => {
      expect(`
          declare global {
            export type URL = {};
          }

          type Test = URL;
        `).not.toMatchSpecifier({
        from: 'package',
        name: 'URL',
        package: 'global',
      });
    });

    it.for([
      [
        'import type {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: 'Symbol', package: 'typescript' },
      ],
      [
        'import type {Node} from "typescript"; type Test = Node | Symbol;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import type {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: ['Symbol', 'Checker'], package: 'typescript' },
      ],
      [
        'import type {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: 'Node', package: 'other-package' },
      ],
      [
        'import type {Node} from "typescript"; type Test = Node;',
        { from: 'package', name: ['Node', 'Symbol'], package: 'other-package' },
      ],
      [
        'interface Node {prop: string}; type Test = Node;',
        { from: 'package', name: 'Node', package: 'typescript' },
      ],
      [
        'import type {Node as TsNode} from "typescript"; type Test = TsNode;',
        { from: 'package', name: 'TsNode', package: 'typescript' },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched package specifier: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'lib', name: 'Foo' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'lib', name: ['Foo', 'Bar'] },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'package', name: 'Foo', package: 'foo-package' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'package', name: ['Foo', 'Bar'], package: 'foo-package' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'package', name: 'Foo', package: 'foo-package' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'package',
          name: ['Foo', 'Bar'],
          package: 'foo-package',
        },
      ],
      ['type Test = RegExp;', { from: 'file', name: 'RegExp', path: ROOT_DIR }],
      [
        'type Test = RegExp;',
        { from: 'file', name: ['RegExp', 'BigInt'], path: ROOT_DIR },
      ],
      [
        'type Test = RegExp;',
        {
          from: 'file',
          name: 'RegExp',
          path: `${ROOT_DIR}/tests/fixtures/file.ts`,
        },
      ],
      [
        'type Test = RegExp;',
        {
          from: 'file',
          name: ['RegExp', 'BigInt'],
          path: `${ROOT_DIR}/tests/fixtures/file.ts`,
        },
      ],
      [
        'type Test = RegExp;',
        { from: 'package', name: 'RegExp', package: 'foo-package' },
      ],
      [
        'type Test = RegExp;',
        { from: 'package', name: ['RegExp', 'BigInt'], package: 'foo-package' },
      ],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match a mismatched specifier type: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );

    it.for([
      ['type Test = Foo;', { from: 'lib', name: 'Foo' }],
      ['type Test = Foo;', { from: 'lib', name: ['Foo', 'number'] }],
    ] as const satisfies [string, TypeOrValueSpecifier][])(
      "doesn't match an error type: %s\n\t%s",
      ([code, typeOrValueSpecifier], { expect }) => {
        expect(code).not.toMatchSpecifier(typeOrValueSpecifier);
      },
    );
  });

  describe(valueMatchesSpecifier, () => {
    function parseCode(code: string) {
      const rootDir = path.join(__dirname, 'fixtures');
      const { ast, services } = parseForESLint(code, {
        disallowAutomaticSingleRunInference: true,
        filePath: path.join(rootDir, 'file.ts'),
        project: './tsconfig.json',
        tsconfigRootDir: rootDir,
      });
      assert.isNotNull(services.program);

      return { ast, services };
    }

    describe(AST_NODE_TYPES.VariableDeclaration, () => {
      function runTests(
        code: string,
        specifier: TypeOrValueSpecifier,
        expected: boolean,
      ) {
        const { ast, services } = parseCode(code);
        const declaration = ast.body.at(-1) as TSESTree.VariableDeclaration;
        const { id, init } = declaration.declarations[0];
        const type = services.getTypeAtLocation(id);
        expect(
          valueMatchesSpecifier(init!, specifier, services.program, type),
        ).toBe(expected);
      }

      function runTestPositive(
        code: string,
        specifier: TypeOrValueSpecifier,
      ): void {
        runTests(code, specifier, true);
      }

      function runTestNegative(
        code: string,
        specifier: TypeOrValueSpecifier,
      ): void {
        runTests(code, specifier, false);
      }

      it.each<[string, TypeOrValueSpecifier]>([
        ['const value = 45;', 'value'],
        ['let value = 45;', 'value'],
        ['var value = 45;', 'value'],
      ])(
        'does not match for non-Identifier or non-JSXIdentifier node: %s',
        runTestNegative,
      );

      it.each<[string, TypeOrValueSpecifier]>([
        ['const value = 45; const hoge = value;', 'value'],
        ['let value = 45; const hoge = value;', 'value'],
        ['var value = 45; const hoge = value;', 'value'],
      ])('matches a matching universal string specifier: %s', runTestPositive);

      it.each<[string, TypeOrValueSpecifier]>([
        ['const value = 45; const hoge = value;', 'incorrect'],
      ])(
        "doesn't match a mismatched universal string specifier: %s",
        runTestNegative,
      );

      it.each<[string, TypeOrValueSpecifier]>([
        [
          'const value = 45; const hoge = value;',
          { from: 'file', name: 'value' },
        ],
        [
          'const value = 45; const hoge = value;',
          { from: 'file', name: ['value', 'hoge'] },
        ],
        [
          'let value = 45; const hoge = value;',
          { from: 'file', name: 'value' },
        ],
        [
          'var value = 45; const hoge = value;',
          { from: 'file', name: 'value' },
        ],
      ])('matches a matching file specifier: %s', runTestPositive);

      it.each<[string, TypeOrValueSpecifier]>([
        [
          'const value = 45; const hoge = value;',
          { from: 'file', name: 'incorrect' },
        ],
        [
          'const value = 45; const hoge = value;',
          { from: 'file', name: ['incorrect', 'invalid'] },
        ],
      ])("doesn't match a mismatched file specifier: %s", runTestNegative);

      it.each<[string, TypeOrValueSpecifier]>([
        ['const value = console', { from: 'lib', name: 'console' }],
        ['const value = console', { from: 'lib', name: ['console', 'hoge'] }],
        ['let value = console', { from: 'lib', name: 'console' }],
        ['var value = console', { from: 'lib', name: 'console' }],
      ])('matches a matching lib specifier: %s', runTestPositive);

      it.each<[string, TypeOrValueSpecifier]>([
        ['const value = console', { from: 'lib', name: 'incorrect' }],
        [
          'const value = console',
          { from: 'lib', name: ['incorrect', 'window'] },
        ],
      ])("doesn't match a mismatched lib specifier: %s", runTestNegative);

      it.each<[string, TypeOrValueSpecifier]>([
        [
          'import { mock } from "node:test"; const hoge = mock;',
          { from: 'package', name: 'mock', package: 'node:test' },
        ],
        [
          'import { mock } from "node:test"; const hoge = mock;',
          { from: 'package', name: ['mock', 'hoge'], package: 'node:test' },
        ],
        [
          `const fs: typeof import("fs"); const module = fs;`,
          { from: 'package', name: 'fs', package: 'fs' },
        ],
      ])('matches a matching package specifier: %s', runTestPositive);

      it.each<[string, TypeOrValueSpecifier]>([
        [
          'import { mock } from "node:test"; const hoge = mock;',
          { from: 'package', name: 'hoge', package: 'node:test' },
        ],
        [
          'import { mock } from "node"; const hoge = mock;',
          { from: 'package', name: 'mock', package: 'node:test' },
        ],
        [
          'const mock = 42; const hoge = mock;',
          { from: 'package', name: 'mock', package: 'node:test' },
        ],
      ])("doesn't match a mismatched package specifier: %s", runTestNegative);
    });

    describe(AST_NODE_TYPES.ClassDeclaration, () => {
      function runTests(
        code: string,
        specifier: TypeOrValueSpecifier,
        expected: boolean,
      ) {
        const { ast, services } = parseCode(code);
        const declaration = ast.body.at(-1) as TSESTree.ClassDeclaration;
        const definition = declaration.body.body.at(
          -1,
        ) as TSESTree.PropertyDefinition;
        const { property } = definition.value as TSESTree.MemberExpression;
        const type = services.getTypeAtLocation(property);
        expect(
          valueMatchesSpecifier(property, specifier, services.program, type),
        ).toBe(expected);
      }

      function runTestPositive(
        code: string,
        specifier: TypeOrValueSpecifier,
      ): void {
        runTests(code, specifier, true);
      }

      function runTestNegative(
        code: string,
        specifier: TypeOrValueSpecifier,
      ): void {
        runTests(code, specifier, false);
      }

      it.each<[string, TypeOrValueSpecifier]>([
        [
          `class MyClass {
            #privateProp = 42;
            value = this.#privateProp;
          }`,
          'privateProp',
        ],
        [
          `
          class MyClass {
            ['computed prop'] = 42;
            value = this['computed prop'];
          }`,
          `computed prop`,
        ],
      ])('matches a matching universal string specifier: %s', runTestPositive);

      it.each<[string, TypeOrValueSpecifier]>([
        [
          `class MyClass {
            #privateProp = 42;
            value = this.#privateProp;
          }`,
          'incorrect',
        ],
      ])('matches a matching universal string specifier: %s', runTestNegative);
    });
  });

  describe(typeMatchesSomeSpecifier, () => {
    function runTests(
      code: string,
      specifiers: TypeOrValueSpecifier[],
      expected: boolean,
    ): void {
      const rootDir = path.join(__dirname, 'fixtures');
      const { ast, services } = parseForESLint(code, {
        disallowAutomaticSingleRunInference: true,
        filePath: path.join(rootDir, 'file.ts'),
        project: './tsconfig.json',
        tsconfigRootDir: rootDir,
      });
      const type = services
        .program!.getTypeChecker()
        .getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(
            (ast.body[ast.body.length - 1] as TSESTree.TSTypeAliasDeclaration)
              .id,
          ),
        );
      expect(
        typeMatchesSomeSpecifier(type, specifiers, services.program!),
      ).toBe(expected);
    }

    function runTestPositive(
      code: string,
      specifiers: TypeOrValueSpecifier[],
    ): void {
      runTests(code, specifiers, true);
    }

    function runTestNegative(
      code: string,
      specifiers: TypeOrValueSpecifier[],
    ): void {
      runTests(code, specifiers, false);
    }

    it.each<[string, TypeOrValueSpecifier[]]>([
      ['interface Foo {prop: string}; type Test = Foo;', ['Foo', 'Hoge']],
      ['type Test = RegExp;', ['RegExp', 'BigInt']],
    ])('matches a matching universal string specifiers', runTestPositive);

    it.each<[string, TypeOrValueSpecifier[]]>([
      ['interface Foo {prop: string}; type Test = Foo;', ['Bar', 'Hoge']],
      ['type Test = RegExp;', ['Foo', 'BigInt']],
    ])(
      "doesn't match a mismatched universal string specifiers",
      runTestNegative,
    );
  });

  describe(valueMatchesSomeSpecifier, () => {
    function runTests(
      code: string,
      specifiers: TypeOrValueSpecifier[] | undefined,
      expected: boolean,
    ): void {
      const rootDir = path.join(__dirname, 'fixtures');
      const { ast, services } = parseForESLint(code, {
        disallowAutomaticSingleRunInference: true,
        filePath: path.join(rootDir, 'file.ts'),
        project: './tsconfig.json',
        tsconfigRootDir: rootDir,
      });
      assert.isNotNull(services.program);

      const declaration = ast.body.at(-1) as TSESTree.VariableDeclaration;
      const { id, init } = declaration.declarations[0];
      const type = services.getTypeAtLocation(id);
      expect(
        valueMatchesSomeSpecifier(init!, specifiers, services.program, type),
      ).toBe(expected);
    }

    function runTestPositive(
      code: string,
      specifiers: TypeOrValueSpecifier[],
    ): void {
      runTests(code, specifiers, true);
    }

    function runTestNegative(
      code: string,
      specifiers: TypeOrValueSpecifier[] | undefined,
    ): void {
      runTests(code, specifiers, false);
    }

    it.each<[string, TypeOrValueSpecifier[]]>([
      ['const value = 45; const hoge = value;', ['value', 'hoge']],
      ['let value = 45; const hoge = value;', ['value', 'hoge']],
      ['var value = 45; const hoge = value;', ['value', 'hoge']],
    ])('matches a matching universal string specifiers: %s', runTestPositive);

    it.each<[string, TypeOrValueSpecifier[] | undefined]>([
      ['const value = 45; const hoge = value;', ['incorrect', 'invalid']],
      ['const value = 45; const hoge = value;', undefined],
    ])(
      "doesn't match a mismatched universal string specifiers: %s",
      runTestNegative,
    );
  });
});
