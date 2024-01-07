import { parserPathSeemsToBeTSESLint } from '../../src/eslint-utils/parserPathSeemsToBeTSESLint';

describe('parserPathSeemsToBeTSESLint', () => {
  test.each([
    ['local.js', false],
    ['../other.js', false],
    ['@babel/eslint-parser/lib/index.cjs', false],
    ['@babel\\eslint-parser\\lib\\index.cjs', false],
    ['node_modules/@babel/eslint-parser/lib/index.cjs', false],
    ['../parser/dist/index.js', true],
    ['../@typescript-eslint/parser/dist/index.js', true],
    ['@typescript-eslint/parser/dist/index.js', true],
    ['@typescript-eslint\\parser\\dist\\index.js', true],
    ['node_modules/@typescript-eslint/parser/dist/index.js', true],
    ['/path/to/typescript-eslint/parser/dist/index.js', true],
    ['/path/to/typescript-eslint/parser/index.js', true],
    ['/path/to/typescript-eslint/packages/parser/dist/index.js', true],
    ['/path/to/typescript-eslint/packages/parser/index.js', true],
    ['/path/to/@typescript-eslint/packages/parser/dist/index.js', true],
    ['/path/to/@typescript-eslint/packages/parser/index.js', true],
  ])('%s', (parserPath, expected) => {
    expect(parserPathSeemsToBeTSESLint(parserPath)).toBe(expected);
  });
});
