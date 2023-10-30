const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptEslintEslintPluginInternal = require('@typescript-eslint/eslint-plugin-internal');
const eslintPluginDeprecation = require('eslint-plugin-deprecation');
const eslintPluginEslintComments = require('eslint-plugin-eslint-comments');
const eslintPluginEslintPlugin = require('eslint-plugin-eslint-plugin');
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginJest = require('eslint-plugin-jest');
const eslintPluginSimpleImportSort = require('eslint-plugin-simple-import-sort');
const eslintPluginUnicorn = require('eslint-plugin-unicorn');
const globals = require('globals');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  js.configs.recommended,
  ...compat.extends(
    'plugin:eslint-plugin/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ),
  {
    plugins: {
      // '@typescript-eslint': typescriptEslintEslintPlugin,
      '@typescript-eslint/internal': typescriptEslintEslintPluginInternal,
      deprecation: eslintPluginDeprecation,
      'eslint-comments': eslintPluginEslintComments,
      // 'eslint-plugin': eslintPluginEslintPlugin,
      import: eslintPluginImport,
      jest: eslintPluginJest,
      'simple-import-sort': eslintPluginSimpleImportSort,
      unicorn: eslintPluginUnicorn,
    },
  },
  {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        project: [
          './tsconfig.eslint.json',
          './packages/*/tsconfig.json',
          './packages/scope-manager/tsconfig.build.json',
          './packages/scope-manager/tsconfig.spec.json',
        ],
        allowAutomaticSingleRunInference: true,
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
        cacheLifetime: { glob: 'Infinity' },
      },
      globals: { ...globals.es2020, ...globals.node },
    },
  },
  {
    rules: {
      'deprecation/deprecation': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-string-starts-ends-with': 'off',
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
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowIIFEs: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-literal-enum-member': [
        'error',
        { allowBitwiseExpressions: true },
      ],
      '@typescript-eslint/unbound-method': 'off',
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
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/internal/no-poorly-typed-ts-props': 'error',
      '@typescript-eslint/internal/no-typescript-default-import': 'error',
      '@typescript-eslint/internal/prefer-ast-types-enum': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'never' }],
      'logical-assignment-operators': 'error',
      'no-else-return': 'error',
      'no-mixed-operators': 'error',
      'no-console': 'error',
      'no-process-exit': 'error',
      'no-fallthrough': [
        'error',
        { commentPattern: '.*intentional fallthrough.*' },
      ],
      'eslint-comments/disable-enable-pair': [
        'error',
        { allowWholeFile: true },
      ],
      'eslint-comments/no-aggregating-enable': 'error',
      'eslint-comments/no-duplicate-disable': 'error',
      'eslint-comments/no-unlimited-disable': 'error',
      'eslint-comments/no-unused-disable': 'error',
      'eslint-comments/no-unused-enable': 'error',
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
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',
      'import/no-default-export': 'error',
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          peerDependencies: true,
          optionalDependencies: false,
        },
      ],
      'import/no-mutable-exports': 'error',
      'import/no-named-default': 'error',
      'import/no-named-export': 'off',
      'import/no-self-import': 'error',
      'import/prefer-default-export': 'off',
      'simple-import-sort/imports': 'error',
      'one-var': ['error', 'never'],
      'unicorn/no-typeof-undefined': 'error',
    },
  },
  ...compat
    .config({ extends: ['plugin:@typescript-eslint/disable-type-checked'] })
    .map(config => ({
      ...config,
      files: ['**/*.js'],
      rules: {
        'deprecation/deprecation': 'off',
        '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    })),
  ...compat.config({ env: { 'jest/globals': true } }).map(config => ({
    ...config,
    files: [
      './packages/*/tests/**/*.spec.ts',
      './packages/*/tests/**/*.test.ts',
      './packages/*/tests/**/spec.ts',
      './packages/*/tests/**/test.ts',
      './packages/parser/tests/**/*.ts',
      './packages/integration-tests/tools/integration-test-base.ts',
      './packages/integration-tests/tools/pack-packages.ts',
    ],
    rules: {
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['arrowFunctions'] },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'eslint-plugin/consistent-output': 'off',
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
  })),
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
  {
    files: [
      './packages/eslint-plugin-internal/tests/rules/**/*.test.ts',
      './packages/eslint-plugin-tslint/tests/rules/**/*.test.ts',
      './packages/eslint-plugin/tests/rules/**/*.test.ts',
      './packages/eslint-plugin/tests/eslint-rules/**/*.test.ts',
    ],
    rules: { '@typescript-eslint/internal/plugin-test-formatting': 'error' },
  },
  {
    files: ['./packages/eslint-plugin/src/rules/index.ts'],
    rules: {
      'sort-keys': 'error',
      'import/order': ['error', { alphabetize: { order: 'asc' } }],
    },
  },
  {
    files: [
      '**/tools/**/*.*t*',
      '**/tests/**/*.ts',
      './packages/repo-tools/**/*.*t*',
      './packages/integration-tests/**/*.*t*',
    ],
    rules: { 'no-console': 'off' },
  },
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
  {
    files: ['./packages/ast-spec/src/**/*.ts'],
    rules: {
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
    rules: { 'import/no-default-export': 'off' },
  },
  ...compat
    .config({
      extends: [
        'plugin:jsx-a11y/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      plugins: ['jsx-a11y', 'react', 'react-hooks'],
      settings: { react: { version: 'detect' } },
    })
    .map(config => ({
      ...config,
      files: ['./packages/website/**/*.{ts,tsx,mts,cts,js,jsx}'],
      rules: {
        '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
        'import/no-default-export': 'off',
        'react/jsx-no-target-blank': 'off',
        'react/no-unescaped-entities': 'off',
        'react-hooks/exhaustive-deps': 'warn',
      },
    })),
  {
    files: ['./packages/website/src/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['./packages/website-eslint/src/mock/**/*.js', '**/*.d.ts'],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    ignores: [
      'dist',
      'jest.config.js',
      'fixtures',
      'coverage',
      '__snapshots__',
      '.docusaurus',
      'build',
      '# Files copied as part of the build',
      'packages/types/src/generated/**/*.ts',
      '# Playground types downloaded from the web',
      'packages/website/src/vendor',
      '# see the file header in eslint-base.test.js for more info',
      'packages/rule-tester/tests/eslint-base',
    ],
  },
];
