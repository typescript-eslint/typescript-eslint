import { toJson } from './lib/json';
import type { ConfigFileType, ConfigModel, ConfigShowAst } from './types';

export const detailTabs: { value: ConfigShowAst; label: string }[] = [
  { value: false, label: 'Errors' },
  { value: 'es', label: 'ESTree' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'scope', label: 'Scope' },
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
  fileType: '.tsx',
  showAST: false,
  sourceType: 'module',
  code: '',
  ts: process.env.TS_VERSION!,
  tsconfig: toJson({
    compilerOptions: {
      strictNullChecks: true,
    },
  }),
  eslintrc: toJson({
    rules: {},
  }),
};
