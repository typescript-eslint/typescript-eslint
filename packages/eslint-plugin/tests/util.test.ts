import * as util from '../src/util';

describe('isDefinitionFile', () => {
  it('returns false for non-definition files', () => {
    const invalid = [
      'test.js',
      'test.jsx',
      'README.md',
      'test.d.js',
      'test.ts.js',
      'test.ts.map',
      'test.ts-js',
      'test.ts',
      'ts',
      'test.tsx',
      'test.TS',
      'test.TSX',
    ];

    invalid.forEach(f => {
      expect(util.isDefinitionFile(f)).toStrictEqual(false);
    });
  });

  it('returns true for definition files', () => {
    const valid = ['test.d.ts', 'test.d.tsx', 'test.D.TS', 'test.D.TSX'];

    valid.forEach(f => {
      expect(util.isDefinitionFile(f)).toStrictEqual(true);
    });
  });
});

describe('upperCaseFirst', () => {
  it('upper cases first', () => {
    expect(util.upperCaseFirst('hello')).toStrictEqual('Hello');
  });
});
