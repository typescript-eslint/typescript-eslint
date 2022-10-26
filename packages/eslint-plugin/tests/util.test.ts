import * as util from '../src/util';

describe('isDefinitionFile', () => {
  describe('returns false for non-definition files', () => {
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
      // yes, it's not a definition file if it's a `.d.tsx`!
      'test.d.tsx',
      'test.D.TSX',
    ];

    invalid.forEach(f => {
      it(f, () => {
        expect(util.isDefinitionFile(f)).toBe(false);
      });
    });
  });

  describe('returns true for definition files', () => {
    const valid = ['test.d.ts', 'test.D.TS'];

    valid.forEach(f => {
      it(f, () => {
        expect(util.isDefinitionFile(f)).toBe(true);
      });
    });
  });
});

describe('upperCaseFirst', () => {
  it('upper cases first', () => {
    expect(util.upperCaseFirst('hello')).toBe('Hello');
  });
});
