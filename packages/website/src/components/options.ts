import type { ConfigFileType, ConfigModel, ConfigShowAst } from './types';

import { toJson } from './lib/json';

export const detailTabs: { label: string; value: ConfigShowAst }[] = [
  { label: 'Errors', value: false },
  { label: 'ESTree', value: 'es' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Scope', value: 'scope' },
  { label: 'Types', value: 'types' },
];

/**
 * List of allowed extensions used in playground
 */
export const fileTypes: ConfigFileType[] = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.d.ts',
  '.cjs',
  '.mjs',
  '.cts',
  '.mts',
];

/**
 * Default config for the playground
 * It's used as a fallback when the URL doesn't contain any config
 */
export const defaultConfig: ConfigModel = {
  code: '',
  eslintrc: toJson({
    rules: {},
  }),
  fileType: '.tsx',
  scroll: true,
  showAST: false,
  showTokens: false,
  sourceType: 'module',
  ts: process.env.TS_VERSION,
  tsconfig: toJson({
    compilerOptions: {
      strictNullChecks: true,
    },
  }),
};
