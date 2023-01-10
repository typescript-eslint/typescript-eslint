import Ajv from 'ajv';

import { typeOrValueSpecifierSchema } from '../src/TypeOrValueSpecifier';

describe('TypeOrValueSpecifier', () => {
  describe('Schema', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(typeOrValueSpecifierSchema);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function runTestPositive(data: any): void {
      expect(validate(data)).toBe(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function runTestNegative(data: any): void {
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
});
