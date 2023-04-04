import type { ConfigFileType, ConfigShowAst } from './types';

export const detailTabs: { value: ConfigShowAst; label: string }[] = [
  { value: false, label: 'Errors' },
  { value: 'es', label: 'ESTree' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'scope', label: 'Scope' },
  { value: 'types', label: 'Types' },
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
