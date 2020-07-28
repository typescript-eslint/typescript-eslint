module.exports = {
  root: true,
  plugins: [
    'eslint-plugin',
    '@typescript-eslint',
    'jest',
    'import',
    'eslint-comments',
    '@typescript-eslint/internal',
  ],
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    sourceType: 'module',
    project: [
      './tsconfig.eslint.json',
      './tests/integration/utils/jsconfig.json',
      './packages/*/tsconfig.json',
    ],
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  rules: {
    //
    // our plugin :D
    //

    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 5,
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': [
      'error',
      { allow: ['arrowFunctions'] },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],

    // TODO - enable these new recommended rules
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    // TODO - enable this
    '@typescript-eslint/naming-convention': 'off',

    //
    // Internal repo rules
    //

    '@typescript-eslint/internal/no-poorly-typed-ts-props': 'error',
    '@typescript-eslint/internal/no-typescript-default-import': 'error',
    '@typescript-eslint/internal/prefer-ast-types-enum': 'error',

    //
    // eslint base
    //

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
    // Prohibit named exports
    'import/no-named-export': 'off', // we want everything to be a named export
    // Forbid a module from importing itself
    'import/no-self-import': 'error',
    // Require modules with a single export to use a default export
    'import/prefer-default-export': 'off', // we want everything to be named
  },
  overrides: [
    // all test files
    {
      files: [
        'packages/*/tests/**/*.test.ts',
        'packages/*/tests/**/*.spec.ts',
        'packages/parser/tests/**/*.ts',
      ],
      env: {
        'jest/globals': true,
      },
      rules: {
        'eslint-plugin/no-identical-tests': 'error',
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
    // plugin source files
    {
      files: [
        'packages/eslint-plugin-internal/**/*.ts',
        'packages/eslint-plugin-tslint/**/*.ts',
        'packages/eslint-plugin/**/*.ts',
      ],
      rules: {
        '@typescript-eslint/internal/no-typescript-estree-import': 'error',
      },
    },
    // plugin rule source files
    {
      files: [
        'packages/eslint-plugin-internal/src/rules/**/*.ts',
        'packages/eslint-plugin-tslint/src/rules/**/*.ts',
        'packages/eslint-plugin/src/configs/**/*.ts',
        'packages/eslint-plugin/src/rules/**/*.ts',
      ],
      rules: {
        // specifically for rules - default exports makes the tooling easier
        'import/no-default-export': 'off',
      },
    },
    // plugin rule tests
    {
      files: [
        'packages/eslint-plugin-internal/tests/rules/**/*.test.ts',
        'packages/eslint-plugin-tslint/tests/rules/**/*.test.ts',
        'packages/eslint-plugin/tests/rules/**/*.test.ts',
        'packages/eslint-plugin/tests/eslint-rules/**/*.test.ts',
      ],
      rules: {
        '@typescript-eslint/internal/plugin-test-formatting': 'error',
      },
    },
    // tools and tests
    {
      files: ['**/tools/**/*.ts', '**/tests/**/*.ts'],
      rules: {
        // allow console logs in tools and tests
        'no-console': 'off',
      },
    },
    // generated files
    {
      files: [
        'packages/scope-manager/src/lib/*.ts',
        'packages/eslint-plugin/src/configs/*.ts',
      ],
      rules: {
        // allow console logs in tools and tests
        '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',
        '@typescript-eslint/internal/no-typescript-default-import': 'off',
        '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
      },
    },
  ],
};
