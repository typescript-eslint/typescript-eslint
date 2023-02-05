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
      'matches a simple string specifier',
      runTestPositive,
    );

    it.each([
      [42],
      [false],
      [null],
      [undefined],
      [['MyType']],
      [(): void => {}],
    ])("doesn't match any non-string basic type", runTestNegative);

    it.each([
      [{ from: 'file', name: 'MyType' }],
      [{ from: 'file', name: ['MyType', 'myValue'] }],
      [{ from: 'file', name: 'MyType', source: './filename.js' }],
      [{ from: 'file', name: ['MyType', 'myValue'], source: './filename.js' }],
    ])('matches a file specifier', runTestPositive);

    it.each([
      [{ from: 'file', name: 42 }],
      [{ from: 'file', name: ['MyType', 42] }],
      [{ from: 'file', name: ['MyType', 'MyType'] }],
      [{ from: 'file', name: [] }],
      [{ from: 'file', source: './filename.js' }],
      [{ from: 'file', name: 'MyType', source: 42 }],
      [{ from: 'file', name: ['MyType', 'MyType'], source: './filename.js' }],
      [{ from: 'file', name: [], source: './filename.js' }],
      [
        {
          from: 'file',
          name: ['MyType', 'myValue'],
          source: ['./filename.js', './another-file.js'],
        },
      ],
      [{ from: 'file', name: 'MyType', unrelatedProperty: '' }],
    ])("doesn't match a malformed file specifier", runTestNegative);

    it.each([
      [{ from: 'lib', name: 'MyType' }],
      [{ from: 'lib', name: ['MyType', 'myValue'] }],
    ])('matches a lib specifier', runTestPositive);

    it.each([
      [{ from: 'lib', name: 42 }],
      [{ from: 'lib', name: ['MyType', 42] }],
      [{ from: 'lib', name: ['MyType', 'MyType'] }],
      [{ from: 'lib', name: [] }],
      [{ from: 'lib' }],
      [{ from: 'lib', name: 'MyType', unrelatedProperty: '' }],
    ])("doesn't match a malformed lib specifier", runTestNegative);

    it.each([
      [{ from: 'package', name: 'MyType', source: './filename.js' }],
      [
        {
          from: 'package',
          name: ['MyType', 'myValue'],
          source: './filename.js',
        },
      ],
    ])('matches a package specifier', runTestPositive);

    it.each([
      [{ from: 'package', name: 42, source: './filename.js' }],
      [{ from: 'package', name: ['MyType', 42], source: './filename.js' }],
      [
        {
          from: 'package',
          name: ['MyType', 'MyType'],
          source: './filename.js',
        },
      ],
      [{ from: 'package', name: [], source: './filename.js' }],
      [{ from: 'package', name: 'MyType' }],
      [{ from: 'package', source: './filename.js' }],
      [{ from: 'package', name: 'MyType', source: 42 }],
      [
        {
          from: 'package',
          name: ['MyType', 'myValue'],
          source: ['./filename.js', './another-file.js'],
        },
      ],
      [
        {
          from: 'package',
          name: 'MyType',
          source: './filename.js',
          unrelatedProperty: '',
        },
      ],
    ])("doesn't match a malformed package specifier", runTestNegative);

    it.each([
      [{ from: ['file'], name: 'MyType' }],
      [{ from: ['lib'], name: 'MyType' }],
      [{ from: ['package'], name: 'MyType' }],
      [{ from: ['file', 'lib'], name: 'MyType' }],
      [{ from: ['file', 'package'], name: 'MyType' }],
      [{ from: ['lib', 'package'], name: 'MyType' }],
      [{ from: ['file', 'lib', 'package'], name: 'MyType' }],
    ])('matches a multi-source specifier', runTestPositive);

    it.each([
      [{ from: [], name: 'MyType' }],
      [{ from: ['invalid'], name: 'MyType' }],
      [{ from: ['file', 'invalid'], name: 'MyType' }],
      [{ from: ['file', 'file'], name: 'MyType' }],
      [{ from: ['file'], name: 42 }],
      [{ from: ['file'] }],
      [{ from: ['file'], name: 'MyType', unrelatedProperty: '' }],
    ])("doesn't match a malformed multi-source specifier", runTestNegative);
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
      const type = services.program
        .getTypeChecker()
        .getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(
            (ast.body[0] as TSESTree.TSTypeAliasDeclaration).id,
          ),
        );
      expect(typeMatchesSpecifier(type, specifier, services.program)).toBe(
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
    ])('correctly matches a universal string specifier', runTestPositive);

    it.each<[string, TypeOrValueSpecifier]>([
      ['interface Foo {prop: string}; type Test = Foo;', 'Bar'],
      ['interface Foo {prop: string}; type Test = Foo;', 'RegExp'],
      ['type Test = RegExp;', 'Foo'],
      ['type Test = RegExp;', 'BigInt'],
    ])(
      "correctly doesn't match a mismatched universal string specifier",
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
        { from: 'file', name: 'Foo', source: 'tests/fixtures/file.ts' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          source: 'tests/fixtures/file.ts',
        },
      ],
    ])('correctly matches a file specifier', runTestPositive);

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
        { from: 'file', name: 'Foo', source: 'tests/fixtures/wrong-file.ts' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'file',
          name: ['Foo', 'Bar'],
          source: 'tests/fixtures/wrong-file.ts',
        },
      ],
    ])("correctly doesn't match a mismatched file specifier", runTestNegative);

    it.each<[string, TypeOrValueSpecifier]>([
      ['type Test = RegExp;', { from: 'lib', name: 'RegExp' }],
      ['type Test = RegExp;', { from: 'lib', name: ['RegExp', 'BigInt'] }],
    ])('correctly matches a lib specifier', runTestPositive);

    it.each<[string, TypeOrValueSpecifier]>([
      ['type Test = RegExp;', { from: 'lib', name: 'BigInt' }],
      ['type Test = RegExp;', { from: 'lib', name: ['BigInt', 'Date'] }],
    ])("correctly doesn't match a mismatched lib specifier", runTestNegative);

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
        { from: 'package', name: 'Foo', source: 'foo-package' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'package', name: ['Foo', 'Bar'], source: 'foo-package' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        { from: 'package', name: 'Foo', source: 'foo-package' },
      ],
      [
        'interface Foo {prop: string}; type Test = Foo;',
        {
          from: 'package',
          name: ['Foo', 'Bar'],
          source: 'foo-package',
        },
      ],
      ['type Test = RegExp;', { from: 'file', name: 'RegExp' }],
      ['type Test = RegExp;', { from: 'file', name: ['RegExp', 'BigInt'] }],
      [
        'type Test = RegExp;',
        { from: 'file', name: 'RegExp', source: 'tests/fixtures/file.ts' },
      ],
      [
        'type Test = RegExp;',
        {
          from: 'file',
          name: ['RegExp', 'BigInt'],
          source: 'tests/fixtures/file.ts',
        },
      ],
      [
        'type Test = RegExp;',
        { from: 'package', name: 'RegExp', source: 'foo-package' },
      ],
      [
        'type Test = RegExp;',
        { from: 'package', name: ['RegExp', 'BigInt'], source: 'foo-package' },
      ],
    ])("correctly doesn't match a mismatched specifier type", runTestNegative);
  });
});
