import type * as Monaco from 'monaco-editor';

import { toJson } from './lib/json';
import versions from './packageVersions.json';
import type { ConfigFileType, ConfigModel, ConfigShowAst } from './types';

export const detailTabs: { value: ConfigShowAst; label: string }[] = [
  { value: false, label: 'Errors' },
  { value: 'es', label: 'ESTree' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'scope', label: 'Scope' },
  { value: 'types', label: 'Types' },
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
  scroll: true,
  showTokens: false,
};

export const tsVersions: string[] = [...versions.typescript];

if (!tsVersions.includes(process.env.TS_VERSION!)) {
  tsVersions.unshift(process.env.TS_VERSION!);
}

export const defaultEditorOptions: Monaco.editor.IStandaloneEditorConstructionOptions =
  {
    minimap: {
      enabled: false,
    },
    fontSize: 13,
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    wrappingIndent: 'same',
    hover: { above: false },
  };
