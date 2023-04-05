// A version of our config that enables many more rules, for use in perf testing

// @ts-check
/** @type {import('./packages/utils/src/ts-eslint/Linter.js').Linter.Config} */
module.exports = {
  extends: ['plugin:@typescript-eslint/all', 'prettier'],
  overrides: [
    {
      files: ['*.js'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    EXPERIMENTAL_memoizeTypeCheckingAPIs:
      !!process.env.MEMOIZE_TYPE_CHECKING_APIS,
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  root: true,
};
