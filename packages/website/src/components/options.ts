import { toJson } from './config/utils';
import type { ConfigFileType, ConfigShowAst } from './types';

export const detailTabs: { value: ConfigShowAst; label: string }[] = [
  { value: false, label: 'Errors' },
  { value: 'es', label: 'ESTree' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'scope', label: 'Scope' },
];

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

export const defaultTsConfig = toJson({
  compilerOptions: {
    strictNullChecks: true,
  },
});

export const defaultEslintConfig = toJson({
  rules: {},
});
