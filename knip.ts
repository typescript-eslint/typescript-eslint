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
  },
} satisfies KnipConfig;
