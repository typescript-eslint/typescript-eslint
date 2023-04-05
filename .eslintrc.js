// @ts-check
/** @type {import('./packages/utils/src/ts-eslint/Linter').Linter.Config} */
module.exports = {
  root: true,
  plugins: [
    '@typescript-eslint',
    '@typescript-eslint/internal',
    'deprecation',
    'eslint-comments',
    'eslint-plugin',
    'import',
    'jest',
    'simple-import-sort',
    'unicorn',
  ],
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:eslint-plugin/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    // TODO: consider enabling strict-type-checked and/or stylistic-type-checked
  ],
  parserOptions: {
    sourceType: 'module',
    project: [
      './tsconfig.eslint.json',
      './packages/*/tsconfig.json',
      /**
       * We are currently in the process of transitioning to nx's out of the box structure and
       * so need to manually specify converted packages' tsconfig.build.json and tsconfig.spec.json
       * files here for now in addition to the tsconfig.json glob pattern.
       *
       * TODO(#4665): Clean this up once all packages have been transitioned.
       */
      './packages/scope-manager/tsconfig.build.json',
      './packages/scope-manager/tsconfig.spec.json',
    ],
    allowAutomaticSingleRunInference: true,
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
    cacheLifetime: {
      // we pretty well never create/change tsconfig structure - so need to ever evict the cache
      // in the rare case that we do - just need to manually restart their IDE.
      glob: 'Infinity',
    },
  },
  rules: {
    // make sure we're not leveraging any deprecated APIs
    'deprecation/deprecation': 'error',

    //
    // our plugin :D
    //

    '@typescript-eslint/array-type': 'error',
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
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: true },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      { allowIIFEs: true },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': [
      'error',
      { allow: ['arrowFunctions'] },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowNumber: true,
        allowBoolean: true,
        allowAny: true,
        allowNullish: true,
        allowRegExp: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],

    //
    // Internal repo rules
    //

    '@typescript-eslint/internal/no-poorly-typed-ts-props': 'error',
    '@typescript-eslint/internal/no-typescript-default-import': 'error',
    '@typescript-eslint/internal/prefer-ast-types-enum': 'error',

    //
    // eslint-base
    //

    curly: ['error', 'all'],
    eqeqeq: [
      'error',
      'always',
      {
        null: 'never',
      },
    ],
    'no-mixed-operators': 'error',
    'no-console': 'error',
    'no-process-exit': 'error',
    'no-fallthrough': [
      'error',
      { commentPattern: '.*intentional fallthrough.*' },
    ],

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
          'global',
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
    // forbid default exports - we want to standardize on named exports so that imported names are consistent
    'import/no-default-export': 'error',
    // disallow imports from duplicate paths
    'import/no-duplicates': 'error',
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

    // enforce a sort order across the codebase
    'simple-import-sort/imports': 'error',

    'one-var': ['error', 'never'],

    'unicorn/no-typeof-undefined': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      rules: {
        // turn off other type-aware rules
        'deprecation/deprecation': 'off',
        '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',

        // turn off rules that don't apply to JS code
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    // all test files
    {
      files: [
        './packages/*/tests/**/*.spec.ts',
        './packages/*/tests/**/*.test.ts',
        './packages/*/tests/**/spec.ts',
        './packages/*/tests/**/test.ts',
        './packages/parser/tests/**/*.ts',
        './packages/integration-tests/tools/integration-test-base.ts',
        './packages/integration-tests/tools/pack-packages.ts',
      ],
      env: {
        'jest/globals': true,
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'eslint-plugin/consistent-output': 'off', // Might eventually be removed from `eslint-plugin/recommended`: https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/issues/284
        'jest/no-disabled-tests': 'error',
        'jest/no-focused-tests': 'error',
        'jest/no-alias-methods': 'error',
        'jest/no-identical-title': 'error',
        'jest/no-jasmine-globals': 'error',
        'jest/no-test-prefixes': 'error',
        'jest/no-done-callback': 'error',
        'jest/no-test-return-statement': 'error',
        'jest/prefer-to-be': 'error',
        'jest/prefer-to-contain': 'error',
        'jest/prefer-to-have-length': 'error',
        'jest/prefer-spy-on': 'error',
        'jest/valid-expect': 'error',
        'jest/no-deprecated-functions': 'error',
      },
    },
    // test utility scripts and website js files
    {
      files: ['tests/**/*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
      },
    },
    // plugin source files
    {
      files: [
        './packages/eslint-plugin-internal/**/*.ts',
        './packages/eslint-plugin-tslint/**/*.ts',
        './packages/eslint-plugin/**/*.ts',
      ],
      rules: {
        '@typescript-eslint/internal/no-typescript-estree-import': 'error',
      },
    },
    // plugin rule source files
    {
      files: [
        './packages/eslint-plugin-internal/src/rules/**/*.ts',
        './packages/eslint-plugin-tslint/src/rules/**/*.ts',
        './packages/eslint-plugin/src/configs/**/*.ts',
        './packages/eslint-plugin/src/rules/**/*.ts',
      ],
      rules: {
        'eslint-plugin/require-meta-docs-description': [
          'error',
          { pattern: '^(Enforce|Require|Disallow) .+[^. ]$' },
        ],

        // specifically for rules - default exports makes the tooling easier
        'import/no-default-export': 'off',

        'no-restricted-syntax': [
          'error',
          {
            selector:
              'ExportDefaultDeclaration Property[key.name="create"] MemberExpression[object.name="context"][property.name="options"]',
            message:
              "Retrieve options from create's second parameter so that defaultOptions are applied.",
          },
        ],
      },
    },
    // plugin rule tests
    {
      files: [
        './packages/eslint-plugin-internal/tests/rules/**/*.test.ts',
        './packages/eslint-plugin-tslint/tests/rules/**/*.test.ts',
        './packages/eslint-plugin/tests/rules/**/*.test.ts',
        './packages/eslint-plugin/tests/eslint-rules/**/*.test.ts',
      ],
      rules: {
        '@typescript-eslint/internal/plugin-test-formatting': 'error',
      },
    },
    // files which list all the things
    {
      files: ['./packages/eslint-plugin/src/rules/index.ts'],
      rules: {
        // enforce alphabetical ordering
        'sort-keys': 'error',
        'import/order': ['error', { alphabetize: { order: 'asc' } }],
      },
    },
    // tools and tests
    {
      files: [
        '**/tools/**/*.*t*',
        '**/tests/**/*.ts',
        './packages/repo-tools/**/*.*t*',
        './packages/integration-tests/**/*.*t*',
      ],
      rules: {
        // allow console logs in tools and tests
        'no-console': 'off',
      },
    },
    // generated files
    {
      files: [
        './packages/scope-manager/src/lib/*.ts',
        './packages/eslint-plugin/src/configs/*.ts',
      ],
      rules: {
        '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',
        '@typescript-eslint/internal/no-typescript-default-import': 'off',
        '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
      },
    },
    // ast spec specific standardization
    {
      files: ['./packages/ast-spec/src/**/*.ts'],
      rules: {
        // disallow ALL unused vars
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/sort-type-constituents': 'error',
      },
    },
    {
      files: ['./packages/ast-spec/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            name: '@typescript-eslint/typescript-estree',
            message:
              'To prevent nx build errors, all `typescript-estree` imports should be done via `packages/ast-spec/tests/util/parsers/typescript-estree-import.ts`.',
          },
        ],
      },
    },
    {
      files: ['rollup.config.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['./packages/website/**/*.{ts,tsx,mts,cts,js,jsx}'],
      extends: [
        'plugin:jsx-a11y/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      plugins: ['jsx-a11y', 'react', 'react-hooks'],
      rules: {
        '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
        'import/no-default-export': 'off',
        'react/jsx-no-target-blank': 'off',
        'react/no-unescaped-entities': 'off',
        'react-hooks/exhaustive-deps': 'warn', // TODO: enable it later
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      files: ['./packages/website/src/**/*.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
        // allow console logs in the website to help with debugging things in production
        'no-console': 'off',
      },
    },
    {
      files: ['./packages/website-eslint/src/mock/**/*.js', '*.d.ts'],
      rules: {
        // mocks and declaration files have to mirror their original package
        'import/no-default-export': 'off',
      },
    },
  ],
};
