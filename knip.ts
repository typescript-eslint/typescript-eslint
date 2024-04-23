import type { KnipConfig } from 'knip';

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
  workspaces: {
    '.': {
      ignoreDependencies: [
        '@babel/code-frame',
        '@babel/core',
        '@babel/eslint-parser',
        '@babel/parser',
        '@babel/types',
        '@nx/workspace',
        'cross-fetch',
        'glob',
        'husky',
        'jest-specific-snapshot',
        'make-dir',
        'ncp',
        'tmp',

        // imported in eslint.config.js
        '@typescript-eslint/utils',
        // imported in eslint.config.mjs
        '@typescript-eslint/eslint-plugin-internal',
      ],
      entry: ['tools/release/changelog-renderer.js'],
      ignoreBinaries: [
        // https://github.com/webpro/knip/issues/433
        'stylelint',
      ],
    },
    'packages/ast-spec': {
      ignore: [
        'src/**/fixtures/**',
        'tests/*.type-test.ts',
        // @typescript-eslint/typescript-estree is not listed in dependencies to avoid circular dependency errors
        // You can check a more detailed explanation in this file
        'tests/util/parsers/typescript-estree-import.ts',
      ],
    },
    'packages/eslint-plugin': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/eslint-plugin-internal': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/integration-tests': {
      ignore: ['fixtures/**'],
    },
    'packages/parser': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/scope-manager': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/type-utils': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/typescript-estree': {
      entry: ['src/use-at-your-own-risk.ts'],
      ignore: ['tests/fixtures/**'],
    },
    'packages/website': {
      entry: [
        'docusaurus.config.mts',
        'src/pages/**/*.tsx',

        // imported in MDX docs
        'src/components/**/*.tsx',

        // used by Docusaurus
        'src/theme/**/index.tsx',
        'src/theme/prism-include-languages.js',
      ],
      ignoreDependencies: [
        // used in MDX docs
        'raw-loader',

        // it's imported only as type (esquery types are forked and defined in packages/website/typings/esquery.d.ts)
        'esquery',

        '@babel/runtime',
        '@docusaurus/mdx-loader',
        '@docusaurus/types',
        '@docusaurus/plugin-content-docs',
        '@docusaurus/theme-search-algolia',
        '@docusaurus/ExecutionEnvironment',
        '@docusaurus/Link',
        '@docusaurus/router',
        '@docusaurus/useDocusaurusContext',
        '@docusaurus/useBaseUrl',
        '@docusaurus/BrowserOnly',
        '@docusaurus/theme-classic',
        '@generated/docusaurus.config',
        '^@theme/.*',
        '^@theme-original/.*',
      ],
    },
    'packages/website-eslint': {
      ignoreDependencies: [
        // virtual module
        'vt',
      ],
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
    },
    'tools/dummypkg': {},
  },
} satisfies KnipConfig;
