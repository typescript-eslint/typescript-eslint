import { parseForESLint } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/utils';
import Ajv from 'ajv';
import path from 'path';

import type { TypeOrValueSpecifier } from '../src/TypeOrValueSpecifier';
import {
  typeMatchesSpecifier,
  typeOrValueSpecifierSchema,
} from '../src/TypeOrValueSpecifier';

describe('TypeOrValueSpecifier', () => {
  describe('Schema', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(typeOrValueSpecifierSchema);

    function runTestPositive(data: unknown): void {
      expect(validate(data)).toBe(true);
    }

    function runTestNegative(data: unknown): void {
      expect(validate(data)).toBe(false);
    }

    it.each([['MyType'], ['myValue'], ['any'], ['void'], ['never']])(
      'matches a simple string specifier %s',
      runTestPositive,
    );

    it.each([
      [42],
      [false],
      [null],
      [undefined],
      [['MyType']],
      [(): void => {}],
    ])("doesn't match any non-string basic type: %s", runTestNegative);

    it.each([
      [{ from: 'file', name: 'MyType' }],
      [{ from: 'file', name: ['MyType', 'myValue'] }],
      [{ from: 'file', name: 'MyType', path: './filename.js' }],
      [{ from: 'file', name: ['MyType', 'myValue'], path: './filename.js' }],
    ])('matches a file specifier: %s', runTestPositive);

    it.each([
      [{ from: 'file', name: 42 }],
      [{ from: 'file', name: ['MyType', 42] }],
      [{ from: 'file', name: ['MyType', 'MyType'] }],
      [{ from: 'file', name: [] }],
      [{ from: 'file', path: './filename.js' }],
      [{ from: 'file', name: 'MyType', path: 42 }],
      [{ from: 'file', name: ['MyType', 'MyType'], path: './filename.js' }],
      [{ from: 'file', name: [], path: './filename.js' }],
      [
        {
          from: 'file',
          name: ['MyType', 'myValue'],
          path: ['./filename.js', './another-file.js'],
        },
      ],
      [{ from: 'file', name: 'MyType', unrelatedProperty: '' }],
    ])("doesn't match a malformed file specifier: %s", runTestNegative);

    it.each([
      [{ from: 'lib', name: 'MyType' }],
      [{ from: 'lib', name: ['MyType', 'myValue'] }],
    ])('matches a lib specifier: %s', runTestPositive);

    it.each([
      [{ from: 'lib', name: 42 }],
      [{ from: 'lib', name: ['MyType', 42] }],
      [{ from: 'lib', name: ['MyType', 'MyType'] }],
      [{ from: 'lib', name: [] }],
      [{ from: 'lib' }],
      [{ from: 'lib', name: 'MyType', unrelatedProperty: '' }],
    ])("doesn't match a malformed lib specifier: %s", runTestNegative);

    it.each([
      [{ from: 'package', name: 'MyType', package: 'jquery' }],
      [
        {
          from: 'package',
          name: ['MyType', 'myValue'],
          package: 'jquery',
        },
      ],
    ])('matches a package specifier: %s', runTestPositive);

    it.each([
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
          package: ['jquery', './another-file.js'],
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
    ])("doesn't match a malformed package specifier: %s", runTestNegative);
  });

  describe('typeMatchesSpecifier', () => {
    function runTests(
      code: string,
      specifier: TypeOrValueSpecifier,
      expected: boolean,
    ): void {
      const rootDir = path.join(__dirname, 'fixtures');
      const { ast, services } = parseForESLint(code, {
        project: './tsconfig.json',
        filePath: path.join(rootDir, 'file.ts'),
        tsconfigRootDir: rootDir,
      });
      const type = services
        .program!.getTypeChecker()
        .getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(
            (ast.body[0] as TSESTree.TSTypeAliasDeclaration).id,
          ),
        );
      expect(typeMatchesSpecifier(type, specifier, services.program!)).toBe(
        expected,
      );
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
      ['interface Foo {prop: string}; type Test = Foo;', 'Foo'],
      ['type Test = RegExp;', 'RegExp'],
    ])('matches a matching universal string specifier', runTestPositive);

    it.each<[string, TypeOrValueSpecifier]>([
      ['interface Foo {prop: string}; type Test = Foo;', 'Bar'],
      ['interface Foo {prop: string}; type Test = Foo;', 'RegExp'],
      ['type Test = RegExp;', 'Foo'],
      ['type Test = RegExp;', 'BigInt'],
    ])(
      "doesn't match a mismatched universal string specifier",
      runTestNegative,
    );

    it.each<[string, TypeOrValueSpecifier]>([
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Foo' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: ['Foo', 'Bar'] },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Foo', path: 'tests/fixtures/file.ts' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: 'Foo',
          path: 'tests/../tests/fixtures/////file.ts',
        },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          path: 'tests/fixtures/file.ts',
        },
      ],
    ])('matches a matching file specifier: %s', runTestPositive);

    it.each<[string, TypeOrValueSpecifier]>([
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Bar' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: ['Bar', 'Baz'] },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'file', name: 'Foo', path: 'tests/fixtures/wrong-file.ts' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          path: 'tests/fixtures/wrong-file.ts',
        },
      ],
    ])("doesn't match a mismatched file specifier: %s", runTestNegative);

    it.each<[string, TypeOrValueSpecifier]>([
      ['type Test = RegExp;', { from: 'lib', name: 'RegExp' }],
      ['type Test = RegExp;', { from: 'lib', name: ['RegExp', 'BigInt'] }],
    ])('matches a matching lib specifier: %s', runTestPositive);

    it.each<[string, TypeOrValueSpecifier]>([
      ['type Test = RegExp;', { from: 'lib', name: 'BigInt' }],
      ['type Test = RegExp;', { from: 'lib', name: ['BigInt', 'Date'] }],
    ])("doesn't match a mismatched lib specifier: %s", runTestNegative);

    it.each<[string, TypeOrValueSpecifier]>([
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
      ['type Test = RegExp;', { from: 'file', name: 'RegExp' }],
      ['type Test = RegExp;', { from: 'file', name: ['RegExp', 'BigInt'] }],
      [
        'type Test = RegExp;',
        { from: 'file', name: 'RegExp', path: 'tests/fixtures/file.ts' },
      ],
      [
        'type Test = RegExp;',
        {
          from: 'file',
          name: ['RegExp', 'BigInt'],
          path: 'tests/fixtures/file.ts',
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
    ])("doesn't match a mismatched specifier type: %s", runTestNegative);
  });
});
