// @ts-check

import url from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslintInternalPlugin from '@typescript-eslint/eslint-plugin-internal';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import regexpPlugin from 'eslint-plugin-regexp';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  // register all of the plugins up-front
  {
    // note - intentionally uses computed syntax to make it easy to sort the keys
    /* eslint-disable no-useless-computed-key */
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['@typescript-eslint/internal']: tseslintInternalPlugin,
      ['eslint-comments']: eslintCommentsPlugin,
      ['eslint-plugin']: eslintPluginPlugin,
      // https://github.com/import-js/eslint-plugin-import/issues/2948
      ['import']: fixupPluginRules(importPlugin),
      ['jest']: jestPlugin,
      ['jsdoc']: jsdocPlugin,
      ['jsx-a11y']: jsxA11yPlugin,
      // https://github.com/facebook/react/issues/28313
      ['react-hooks']: fixupPluginRules(reactHooksPlugin),
      // https://github.com/jsx-eslint/eslint-plugin-react/issues/3699
      ['react']: fixupPluginRules(reactPlugin),
      ['regexp']: regexpPlugin,
      ['simple-import-sort']: simpleImportSortPlugin,
      ['sonarjs']: sonarjsPlugin,
      ['unicorn']: unicornPlugin,
    },
    /* eslint-enable no-useless-computed-key */
  },
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: [
      '.nx/',
      '.yarn/',
      '**/jest.config.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/fixtures/**',
      '**/coverage/**',
      '**/__snapshots__/**',
      '**/.docusaurus/**',
      '**/build/**',
      '.nx/*',
      '.yarn/*',
      // Files copied as part of the build
      'packages/types/src/generated/**/*.ts',
      // Playground types downloaded from the web
      'packages/website/src/vendor/',
      // see the file header in eslint-base.test.js for more info
      'packages/rule-tester/tests/eslint-base/',
    ],
  },

  // extends ...
  eslint.configs.recommended,
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
        projectService: true,
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      // TODO: https://github.com/typescript-eslint/typescript-eslint/issues/8538
      '@typescript-eslint/no-confusing-void-expression': 'off',

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
      // TODO: enable it once we drop support for TS<5.0
      // https://github.com/typescript-eslint/typescript-eslint/issues/10065
      '@typescript-eslint/consistent-type-exports': [
        'off', // 'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
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
      'no-constant-condition': 'off',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true, checkTypePredicates: true },
      ],
      '@typescript-eslint/no-unnecessary-type-parameters': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-literal-enum-member': [
        'error',
        {
          allowBitwiseExpressions: true,
        },
      ],
      '@typescript-eslint/prefer-string-starts-ends-with': [
        'error',
        {
          allowSingleElementEquality: 'always',
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
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: ['/package\\.json$'],
        },
      ],

      //
      // Internal repo rules
      //

      '@typescript-eslint/internal/no-poorly-typed-ts-props': 'error',
      '@typescript-eslint/internal/no-relative-paths-to-internal-packages':
        'error',
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
      'no-implicit-coercion': ['error', { boolean: false }],
      'no-lonely-if': 'error',
      'no-unreachable-loop': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-var': 'error',
      'no-void': ['error', { allowAsStatement: true }],
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'operator-assignment': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-object-has-own': 'error',
      'prefer-object-spread': 'error',
      'prefer-rest-params': 'error',
      'prefer-template': 'error',
      radix: 'error',

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
      'jsdoc/informative-docs': 'error',
      // https://github.com/gajus/eslint-plugin-jsdoc/issues/1175
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-yields': 'off',
      'jsdoc/tag-lines': 'off',

      'regexp/no-dupe-disjunctions': 'error',
      'regexp/no-useless-character-class': 'error',
      'regexp/no-useless-flag': 'error',
      'regexp/no-useless-lazy': 'error',
      'regexp/no-useless-non-capturing-group': 'error',
      'regexp/prefer-quantifier': 'error',
      'regexp/prefer-question-quantifier': 'error',
      'regexp/prefer-w': 'error',

      'sonarjs/no-duplicated-branches': 'error',

      //
      // eslint-plugin-unicorn
      //

      'unicorn/no-length-as-slice-end': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-typeof-undefined': 'error',
      'unicorn/no-single-promise-in-promise-methods': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-export-from': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-structured-clone': 'error',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      // turn off other type-aware rules
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
      'packages/*/tests/**/*.test.{ts,tsx,cts,mts}',
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
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
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

    extends: [...compat.config(eslintPluginPlugin.configs.recommended)],
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
      'eslint-plugin/no-property-in-node': [
        'error',
        {
          additionalNodeTypeFiles: [
            'packages[\\/]types[\\/]src[\\/]generated[\\/]ast-spec.ts',
          ],
        },
      ],
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
      ...fixupConfigRules(compat.config(reactPlugin.configs.recommended)),
      ...fixupConfigRules(compat.config(reactHooksPlugin.configs.recommended)),
    ],
    rules: {
      '@typescript-eslint/internal/prefer-ast-types-enum': 'off',
      'import/no-default-export': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn', // TODO: enable it later
      'react/prop-types': 'off',
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
  {
    extends: [perfectionistPlugin.configs['recommended-alphabetical']],
    ignores: ['packages/typescript-eslint/src/configs/*'],
    files: [
      'packages/ast-spec/{src,tests,typings}/**/*.ts',
      'packages/integration-tests/{tests,tools,typing}/**/*.ts',
      'packages/parser/{src,tests}/**/*.ts',
      'packages/rule-schema-to-typescript-types/src/**/*.ts',
      'packages/rule-tester/{src,tests,typings}/**/*.ts',
      'packages/types/{src,tools}/**/*.ts',
      'packages/typescript-eslint/{src,tests}/**/*.ts',
      'packages/utils/src/**/*.ts',
      'packages/visitor-keys/src/**/*.ts',
      'packages/website*/src/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/sort-type-constituents': 'off',
      'perfectionist/sort-classes': [
        'error',
        {
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
      'perfectionist/sort-enums': 'off',
      'perfectionist/sort-objects': [
        'error',
        {
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
      'perfectionist/sort-union-types': [
        'error',
        {
          order: 'asc',
          groups: ['unknown', 'keyword', 'nullish'],
          type: 'natural',
        },
      ],
      'simple-import-sort/imports': 'off',
    },
  },
);
