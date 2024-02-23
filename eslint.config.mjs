// @ts-check

import url from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslintInternalPlugin from '@typescript-eslint/eslint-plugin-internal';
import deprecationPlugin from 'eslint-plugin-deprecation';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  // register all of the plugins up-front
  {
    // note - intentionally uses computed syntax to make it easy to sort the keys
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['@typescript-eslint/internal']: tseslintInternalPlugin,
      ['deprecation']: deprecationPlugin,
      ['eslint-comments']: eslintCommentsPlugin,
      ['eslint-plugin']: eslintPluginPlugin,
      ['import']: importPlugin,
      ['jest']: jestPlugin,
      ['jsdoc']: jsdocPlugin,
      ['jsx-a11y']: jsxA11yPlugin,
      ['react-hooks']: reactHooksPlugin,
      ['react']: reactPlugin,
      ['simple-import-sort']: simpleImportSortPlugin,
      ['unicorn']: unicornPlugin,
    },
  },
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: [
      '**/jest.config.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/fixtures/**',
      '**/coverage/**',
      '**/__snapshots__/**',
      '**/.docusaurus/**',
      '**/build/**',
      // Files copied as part of the build
      'packages/types/src/generated/**/*.ts',
      // Playground types downloaded from the web
      'packages/website/src/vendor',
      // see the file header in eslint-base.test.js for more info
      'packages/rule-tester/tests/eslint-base',
    ],
  },

  // extends ...
  eslint.configs.recommended,
  ...compat.config(eslintPluginPlugin.configs.recommended),
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  jsdocPlugin.configs['flat/recommended-typescript-error'],

  // base config
  {
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        cacheLifetime: {
          // we pretty well never create/change tsconfig structure - so no need to ever evict the cache
          // in the rare case that we do - just need to manually restart their IDE.
          glob: 'Infinity',
        },
        sourceType: 'module',
        project: [
          'tsconfig.json',
          'packages/*/tsconfig.json',
          /**
           * We are currently in the process of transitioning to nx's out of the box structure and
           * so need to manually specify converted packages' tsconfig.build.json and tsconfig.spec.json
           * files here for now in addition to the tsconfig.json glob pattern.
           *
           * TODO(#4665): Clean this up once all packages have been transitioned.
           */
          'packages/scope-manager/tsconfig.build.json',
          'packages/scope-manager/tsconfig.spec.json',
        ],
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      // make sure we're not leveraging any deprecated APIs
      'deprecation/deprecation': 'error',

      // TODO(#7130): Investigate changing these in or removing these from presets
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-string-starts-ends-with': 'off',

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
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: true },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowIIFEs: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-constant-condition': 'off',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-literal-enum-member': [
        'error',
        {
          allowBitwiseExpressions: true,
        },
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
          caughtErrors: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignoreConditionalTests: true,
          ignorePrimitives: true,
        },
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
      'logical-assignment-operators': 'error',
      'no-else-return': 'error',
      'no-mixed-operators': 'error',
      'no-console': 'error',
      'no-process-exit': 'error',
      'no-fallthrough': [
        'error',
        { commentPattern: '.*intentional fallthrough.*' },
      ],
      'one-var': ['error', 'never'],

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
      // enforces consistent type specifier style for named imports
      'import/consistent-type-specifier-style': 'error',
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

      //
      // eslint-plugin-jsdoc
      //

      // We often use @remarks or other ad-hoc tag names
      'jsdoc/check-tag-names': 'off',
      // https://github.com/gajus/eslint-plugin-jsdoc/issues/1169
      'jsdoc/check-param-names': 'off',
      // https://github.com/gajus/eslint-plugin-jsdoc/issues/1175
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-yields': 'off',
      'jsdoc/tag-lines': 'off',

      //
      // eslint-plugin-unicorn
      //

      'unicorn/no-typeof-undefined': 'error',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      // turn off other type-aware rules
      'deprecation/deprecation': 'off',
      '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',

      // turn off rules that don't apply to JS code
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  //
  // test file linting
  //

  // define the jest globals for all test files
  {
    files: ['packages/*/tests/**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
  },
  // test file specific configuration
  {
    files: [
      'packages/*/tests/**/*.spec.{ts,tsx,cts,mts}',
      'packages/*/tests/**/*.test.{ts,tsx,cts,mts}',
      'packages/*/tests/**/spec.{ts,tsx,cts,mts}',
      'packages/*/tests/**/test.{ts,tsx,cts,mts}',
      'packages/parser/tests/**/*.{ts,tsx,cts,mts}',
      'packages/integration-tests/tools/integration-test-base.ts',
      'packages/integration-tests/tools/pack-packages.ts',
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
  // plugin rule tests
  {
    files: [
      'packages/eslint-plugin-internal/tests/rules/**/*.test.{ts,tsx,cts,mts}',
      'packages/eslint-plugin-tslint/tests/rules/**/*.test.{ts,tsx,cts,mts}',
      'packages/eslint-plugin/tests/rules/**/*.test.{ts,tsx,cts,mts}',
      'packages/eslint-plugin/tests/eslint-rules/**/*.test.{ts,tsx,cts,mts}',
    ],
    rules: {
      '@typescript-eslint/internal/plugin-test-formatting': 'error',
    },
  },

  //
  // tools and tests
  //
  {
    files: [
      '**/tools/**/*.{ts,tsx,cts,mts}',
      '**/tests/**/*.{ts,tsx,cts,mts}',
      'packages/repo-tools/**/*.{ts,tsx,cts,mts}',
      'packages/integration-tests/**/*.{ts,tsx,cts,mts}',
    ],
    rules: {
      // allow console logs in tools and tests
      'no-console': 'off',
    },
  },
  {
    files: ['eslint.config.{js,cjs,mjs}'],
    rules: {
      // requirement
      'import/no-default-export': 'off',
    },
  },

  //
  // plugin source file linting
  //

  {
    files: [
      'packages/eslint-plugin-internal/**/*.{ts,tsx,cts,mts}',
      'packages/eslint-plugin-tslint/**/*.{ts,tsx,cts,mts}',
      'packages/eslint-plugin/**/*.{ts,tsx,cts,mts}',
    ],
    rules: {
      '@typescript-eslint/internal/no-typescript-estree-import': 'error',
    },
  },
  {
    files: [
      'packages/eslint-plugin-internal/src/rules/**/*.{ts,tsx,cts,mts}',
      'packages/eslint-plugin-tslint/src/rules/**/*.{ts,tsx,cts,mts}',
      'packages/eslint-plugin/src/configs/**/*.{ts,tsx,cts,mts}',
      'packages/typescript-eslint/src/configs/**/*.{ts,tsx,cts,mts}',
      'packages/core/src/configs/**/*.{ts,tsx,cts,mts}',
      'packages/eslint-plugin/src/rules/**/*.{ts,tsx,cts,mts}',
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
  {
    files: ['packages/eslint-plugin/src/rules/index.ts'],
    rules: {
      // enforce alphabetical ordering
      'sort-keys': 'error',
      'import/order': ['error', { alphabetize: { order: 'asc' } }],
    },
  },

  //
  // generated files
  //

  {
    files: [
      'packages/scope-manager/src/lib/*.{ts,tsx,cts,mts}',
      'packages/eslint-plugin/src/configs/*.{ts,tsx,cts,mts}',
      'packages/core/src/configs/*.{ts,tsx,cts,mts}',
    ],
    rules: {
      '@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',
      '@typescript-eslint/internal/no-typescript-default-import': 'off',
      '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
    },
  },

  //
  // ast spec linting
  //

  {
    files: ['packages/ast-spec/src/**/*.{ts,tsx,cts,mts}'],
    rules: {
      // disallow ALL unused vars
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'all' }],
      '@typescript-eslint/sort-type-constituents': 'error',
    },
  },
  {
    files: ['packages/ast-spec/**/*.{ts,tsx,cts,mts}'],
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

  //
  // website linting
  //

  {
    files: ['packages/website/**/*.{ts,tsx,mts,cts,js,jsx}'],
    extends: [
      ...compat.config(jsxA11yPlugin.configs.recommended),
      ...compat.config(reactPlugin.configs.recommended),
      ...compat.config(reactHooksPlugin.configs.recommended),
    ],
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
    files: ['packages/website/src/**/*.{ts,tsx,cts,mts}'],
    rules: {
      'import/no-default-export': 'off',
      // allow console logs in the website to help with debugging things in production
      'no-console': 'off',
    },
  },
  {
    files: [
      'packages/website-eslint/src/mock/**/*.js',
      '**/*.d.{ts,tsx,cts,mts}',
    ],
    rules: {
      // mocks and declaration files have to mirror their original package
      'import/no-default-export': 'off',
    },
  },
);
