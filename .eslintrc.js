module.exports = {
  root: true,
  plugins: ['eslint-plugin', '@typescript-eslint', 'jest'],
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-mixed-operators': 'error',
    'no-console': 'off',
    'no-undef': 'off',

    // TODO - enable these rules as we clean up the codebase
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
    // TODO - when we enable rules with typechecking
    // project: [
    //   './packages/eslint-plugin/tsconfig.json',
    //   './packages/eslint-plugin-tslint/tsconfig.json',
    //   './packages/parser/tsconfig.json',
    //   './packages/typescript-estree/tsconfig.json',
    // ],
  },
  overrides: [
    {
      files: [
        'packages/eslint-plugin-tslint/tests/**/*.ts',
        'packages/eslint-plugin/tests/**/*.test.ts',
        'packages/parser/tests/**/*.ts',
        'packages/typescript-estree/tests/**/*.ts',
      ],
      env: {
        'jest/globals': true,
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-alias-methods': 'error',
        'jest/no-identical-title': 'error',
        'jest/no-jasmine-globals': 'error',
        'jest/no-jest-import': 'error',
        'jest/no-test-prefixes': 'error',
        'jest/no-test-callback': 'error',
        'jest/no-test-return-statement': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/prefer-spy-on': 'error',
        'jest/valid-expect': 'error',
      },
    },
    {
      files: [
        'packages/eslint-plugin/test/**/*.ts',
        'packages/eslint-plugin-tslint/tests/**/*.spec.ts',
      ],
      rules: {
        'eslint-plugin/no-identical-tests': 'error',
      },
    },
  ],
};
