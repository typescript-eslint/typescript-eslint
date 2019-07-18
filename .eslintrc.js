module.exports = {
  root: true,
  plugins: [
    'eslint-plugin',
    '@typescript-eslint',
    'jest',
    'import',
    'eslint-comments',
  ],
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    //
    // our plugin :D
    //

    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',

    //
    // eslint base
    //

    'comma-dangle': ['error', 'always-multiline'],
    curly: ['error', 'all'],
    'no-mixed-operators': 'error',
    'no-console': 'error',
    'no-process-exit': 'error',

    //
    // eslint-plugin-eslint-comment
    //

    // require a eslint-enable comment for every eslint-disable comment
    'eslint-comments/disable-enable-pair': [
      'error',
      {
        allowWholeFile: true,
      },
    ],
    // disallow a eslint-enable comment for multiple eslint-disable comments
    'eslint-comments/no-aggregating-enable': 'error',
    // disallow duplicate eslint-disable comments
    'eslint-comments/no-duplicate-disable': 'error',
    // disallow eslint-disable comments without rule names
    'eslint-comments/no-unlimited-disable': 'error',
    // disallow unused eslint-disable comments
    'eslint-comments/no-unused-disable': 'error',
    // disallow unused eslint-enable comments
    'eslint-comments/no-unused-enable': 'error',
    // disallow ESLint directive-comments
    'eslint-comments/no-use': [
      'error',
      {
        allow: [
          'eslint-disable',
          'eslint-disable-line',
          'eslint-disable-next-line',
          'eslint-enable',
        ],
      },
    ],

    //
    // eslint-plugin-import
    //

    // disallow non-import statements appearing before import statements
    'import/first': 'error',
    // Require a newline after the last import/require in a group
    'import/newline-after-import': 'error',
    // Forbid import of modules using absolute paths
    'import/no-absolute-path': 'error',
    // disallow AMD require/define
    'import/no-amd': 'error',
    // forbid default exports
    'import/no-default-export': 'error',
    // Forbid the use of extraneous packages
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        peerDependencies: true,
        optionalDependencies: false,
      },
    ],
    // Forbid mutable exports
    'import/no-mutable-exports': 'error',
    // Prevent importing the default as if it were named
    'import/no-named-default': 'error',
    // Prohibit named exports // we want everything to be a named export
    'import/no-named-export': 'off',
    // Forbid a module from importing itself
    'import/no-self-import': 'error',
    // Require modules with a single export to use a default export // we want everything to be named
    'import/prefer-default-export': 'off',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
    project: './tsconfig.base.json',
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
        'packages/eslint-plugin/tests/**/*.test.ts',
        'packages/eslint-plugin-tslint/tests/**/*.spec.ts',
      ],
      rules: {
        'eslint-plugin/no-identical-tests': 'error',
      },
    },
    {
      files: [
        'packages/eslint-plugin/src/rules/**/*.ts',
        'packages/eslint-plugin/src/configs/**/*.ts',
        'packages/eslint-plugin-tslint/src/rules/**/*.ts',
      ],
      rules: {
        // specifically for rules - default exports makes the tooling easier
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['**/tools/**/*.ts', '**/tests/**/*.ts'],
      rules: {
        // allow console logs in tools and tests
        'no-console': 'off',
      },
    },
  ],
};
