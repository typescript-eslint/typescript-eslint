import type { KnipConfig } from 'knip' with { 'resolution-mode': 'import' };

export default {
  rules: {
    binaries: 'off',
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
      ignoreDependencies: [
        '@nx/workspace',
        // imported for type purposes only
        'website',
      ],

      project: [
        'tools/scripts/**/*.mts',
        '!tools/scripts/typings/typescript.d.ts',
        '!typings/*.d.ts',
      ],
    },
    'packages/ast-spec': {
      ignore: [
        // @typescript-eslint/typescript-estree is not listed in dependencies to avoid circular dependency errors
        // You can check a more detailed explanation in this file
        'tests/util/parsers/typescript-estree-import.ts',
      ],

      project: ['src/**/*.ts', 'tests/util/**/*.ts', '!src/**/fixtures/**'],

      vitest: {
        config: ['vitest.config.mts'],
        entry: [
          'tests/**/*.{bench,test,test-d}.?(c|m)ts?(x)',
          'tests/util/setupVitest.mts',
          'tests/util/custom-matchers/custom-matchers.ts',
          'tests/util/custom-matchers/vitest-custom-matchers.d.ts',
        ],
      },
    },

    'packages/eslint-plugin': {
      ignore: ['typings/eslint-rules.d.ts', 'typings/typescript.d.ts'],

      project: ['src/**/*.ts!', 'tools/**/*.mts'],

      vitest: {
        config: ['vitest.config.mts'],
        entry: ['tests/**/*.{bench,test,test-d}.?(c|m)ts?(x)'],
        project: ['tests/**', '!tests/fixtures/**'],
      },
    },

    'packages/eslint-plugin-internal': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/integration-tests': {
      ignore: ['fixtures/**'],
    },

    'packages/parser': {
      vitest: {
        config: ['vitest.config.mts'],
        entry: [
          'tests/lib/**/*.{bench,test,test-d}.?(c|m)ts?(x)',
          'tests/test-utils/test-utils.ts',
          'tests/test-utils/ts-error-serializer.ts',
        ],
        project: ['tests/**', '!tests/fixtures/**'],
      },
    },

    'packages/rule-tester': {
      ignore: ['typings/eslint.d.ts'],
    },
    'packages/scope-manager': {
      ignore: ['tests/fixtures/**'],

      vitest: {
        config: ['vitest.config.mts'],
        entry: [
          'tests/**/*.{bench,test,test-d}.?(c|m)ts?(x)',
          'tests/test-utils/serializers/index.ts',
          'tests/test-utils/custom-matchers/custom-matchers.ts',
          'tests/test-utils/custom-matchers/vitest-custom-matchers.d.ts',
        ],
      },
    },
    'packages/type-utils': {
      ignore: ['tests/fixtures/**', 'typings/typescript.d.ts'],

      vitest: {
        config: ['vitest.config.mts'],
        entry: [
          'tests/**/*.{bench,test,test-d}.?(c|m)ts?(x)',
          'tests/test-utils/custom-matchers/custom-matchers.ts',
          'tests/test-utils/custom-matchers/vitest-custom-matchers.d.ts',
        ],
      },
    },

    'packages/types': {
      project: [
        'src/**/*.ts!',
        '!src/generated/**/*.ts',
        'tools/copy-ast-spec.mts',
      ],
    },

    'packages/typescript-estree': {
      entry: ['src/use-at-your-own-risk.ts'],
      ignore: ['tests/fixtures/**', 'typings/typescript.d.ts'],

      vitest: {
        config: ['vitest.config.mts'],
        entry: [
          'tests/lib/**/*.{bench,test,test-d}.?(c|m)ts?(x)',
          'tests/test-utils/custom-matchers/custom-matchers.ts',
          'tests/test-utils/custom-matchers/vitest-custom-matchers.d.ts',
        ],
      },
    },
    'packages/utils': {
      ignore: [
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
        'plugins/recent-blog-posts/index.ts',
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
        'src/mock/parser.js',
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
