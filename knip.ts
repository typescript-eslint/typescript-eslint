import type { KnipConfig } from 'knip' with { 'resolution-mode': 'import' };

export default {
  rules: {
    classMembers: 'off',
    duplicates: 'off',
    enumMembers: 'off',
    exports: 'off',
    nsExports: 'off',
    nsTypes: 'off',
    types: 'off',
    unresolved: 'off',
  },

  vite: false,

  vitest: {
    config: ['vitest.config.mts'],
    entry: ['tests/**/*.{bench,test,test-d}.?(c|m)ts?(x)'],
  },

  workspaces: {
    '.': {
      entry: ['tools/release/changelog-renderer.js', 'tools/scripts/**/*.mts'],
      ignore: ['tools/scripts/typings/typescript.d.ts', 'typings/*.d.ts'],
      ignoreDependencies: [
        '@babel/code-frame',
        '@babel/core',
        '@babel/eslint-parser',
        '@babel/parser',
        '@babel/types',
        '@nx/js',
        '@nx/workspace',
        'glob',
        'jest-specific-snapshot',
        'make-dir',
        'ncp',
        'tmp',
        // imported for type purposes only
        'website',
      ],
    },
    'packages/ast-spec': {
      ignore: [
        'src/**/fixtures/**',
        'tests/*.type-test.ts',
        // @typescript-eslint/typescript-estree is not listed in dependencies to avoid circular dependency errors
        // You can check a more detailed explanation in this file
        'tests/util/parsers/typescript-estree-import.ts',
        'typings/global.d.ts',
      ],
    },
    'packages/eslint-plugin': {
      ignore: [
        'tests/fixtures/**',
        'typings/eslint-rules.d.ts',
        'typings/typescript.d.ts',
      ],
    },
    'packages/eslint-plugin-internal': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/integration-tests': {
      ignore: ['fixtures/**', 'typings/global.d.ts'],
    },
    'packages/parser': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/rule-tester': {
      ignore: ['typings/eslint.d.ts'],
    },
    'packages/scope-manager': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/type-utils': {
      ignore: ['tests/fixtures/**', 'typings/typescript.d.ts'],
    },
    'packages/typescript-estree': {
      entry: ['src/use-at-your-own-risk.ts'],
      ignore: ['tests/fixtures/**', 'typings/typescript.d.ts'],

      vitest: {
        config: ['vitest.config.mts'],
        entry: ['tests/lib/**/*.{bench,test,test-d}.?(c|m)ts?(x)'],
      },
    },
    'packages/utils': {
      ignore: [
        'tests/**/*.type-test.ts',
        'typings/eslint.d.ts',
        'typings/eslint-community-eslint-utils.d.ts',
      ],
    },
    'packages/website': {
      entry: [
        'docusaurus.config.mts',
        'src/pages/**/*.tsx',

        // imported in MDX docs
        'src/components/**/*.tsx',

        // used by Docusaurus
        'src/theme/**/*.tsx',
        'src/theme/prism-include-languages.js',
      ],
      ignore: [
        'src/globals.d.ts',
        'src/hooks/*',
        'src/types.d.ts',
        'typings/*',
      ],
      ignoreDependencies: [
        // used in MDX docs
        'raw-loader',

        // it's imported only as type (esquery types are forked and defined in packages/website/typings/esquery.d.ts)
        'esquery',

        '@docusaurus/mdx-loader',
        '@docusaurus/types',
        '@docusaurus/plugin-content-docs',
        '@docusaurus/plugin-content-blog',
        '@docusaurus/theme-search-algolia',
        '@docusaurus/ExecutionEnvironment',
        '@docusaurus/Link',
        '@docusaurus/router',
        '@docusaurus/useDocusaurusContext',
        '@docusaurus/useBaseUrl',
        '@docusaurus/BrowserOnly',
        '@docusaurus/module-type-aliases',
        '@generated/docusaurus.config',
        '^@site/.*',
        '^@theme/.*',
        '^@theme-original/.*',
        'docusaurus-plugin-typedoc',
        'typedoc-plugin-markdown',
      ],
    },
    'packages/website-eslint': {
      entry: [
        'src/index.js',
        'src/mock/assert.js',
        'src/mock/empty.js',
        'src/mock/eslint-rules.js',
        'src/mock/eslint.js',
        'src/mock/lru-cache.js',
        'src/mock/path.js',
        'src/mock/typescript.js',
        'src/mock/util.js',
      ],
      ignoreDependencies: [
        // virtual module
        'vt',
      ],
    },
    'tools/dummypkg': {},
  },
} satisfies KnipConfig;
