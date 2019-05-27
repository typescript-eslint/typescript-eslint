import assert from 'assert';

import * as util from '../src/util';

describe('isTypescript', () => {
  it('returns false for non-typescript files', () => {
    const invalid = [
      'test.js',
      'test.jsx',
      'README.md',
      'test.d.js',
      'test.ts.js',
      'test.ts.map',
      'test.ts-js',
      'ts',
    ];

    invalid.forEach(f => {
      assert.strictEqual(util.isTypeScriptFile(f), false);
    });
  });

  it('returns true for typescript files', () => {
    const valid = [
      'test.ts',
      'test.tsx',
      'test.TS',
      'test.TSX',
      'test.d.ts',
      'test.d.tsx',
      'test.D.TS',
      'test.D.TSX',
    ];

    valid.forEach(f => {
      assert.strictEqual(util.isTypeScriptFile(f), true);
    });
  });
});

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
      assert.strictEqual(util.isDefinitionFile(f), false);
    });
  });

  it('returns true for definition files', () => {
    const valid = ['test.d.ts', 'test.d.tsx', 'test.D.TS', 'test.D.TSX'];

    valid.forEach(f => {
      assert.strictEqual(util.isDefinitionFile(f), true);
    });
  });
});

describe('upperCaseFirst', () => {
  it('upper cases first', () => {
    assert.strictEqual(util.upperCaseFirst('hello'), 'Hello');
  });
});
