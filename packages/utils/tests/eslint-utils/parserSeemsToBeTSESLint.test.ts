import { parserSeemsToBeTSESLint } from '../../src/eslint-utils/parserSeemsToBeTSESLint';

describe(parserSeemsToBeTSESLint, () => {
  test.for([
    [undefined, false],
    ['espree', false],
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
  ] as const)('%s', ([parserPath, expected], { expect }) => {
    expect(parserSeemsToBeTSESLint(parserPath)).toBe(expected);
  });
});
