import type { KnipConfig } from 'knip';

export default {
  rules: {
    // binaries,
    classMembers: 'off',
    // dependencies,
    // devDependencies,
    duplicates: 'off',
    enumMembers: 'off',
    exports: 'off',
    // files,
    nsExports: 'off',
    nsTypes: 'off',
    types: 'off',
    // unlisted,
    // unresolved: 'off',
  },
  workspaces: {
    'packages/ast-spec': {
      ignore: [
        'src/**/fixtures/**',
        'tests/*.type-test.ts',
        'tests/util/parsers/typescript-estree-import.ts',
      ],
    },
    'packages/eslint-plugin': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/eslint-plugin-internal': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/eslint-plugin-tslint': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/integration-tests': {
      ignore: ['fixtures/**'],
    },
    'packages/parser': {
      ignore: ['tests/fixtures/**'],
    },
    'packages/rule-tester': {
      ignore: ['tests/eslint-base/fixtures/**'],
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
        'docusaurus.config.js',
        'src/pages/**/*.tsx',

        'src/components/RulesTable/index.tsx',
        'src/components/TypeScriptOverlap/index.tsx',
        'src/hooks/useRulesMeta.ts',

        'src/theme/CodeBlock/Content/String.tsx',
        'src/theme/MDXComponents/index.tsx',
        'src/theme/NotFound/index.tsx',
        'src/theme/prism-include-languages.js',
      ],
      ignoreDependencies: [
        'raw-loader',
        'react-dom',
        '^@typescript-eslint/.*',
        '^@docusaurus/.*',
        '@generated/docusaurus.config',
        '^@theme/.*',
        '^@theme-original/.*',
        'esquery',
      ],
    },
    'packages/website-eslint': {
      ignoreDependencies: ['vt'],
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
