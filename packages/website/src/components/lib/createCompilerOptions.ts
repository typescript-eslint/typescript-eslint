import type * as ts from 'typescript';

import type { ConfigFileType } from '../types';

const javascriptFileTypes = new Set<ConfigFileType>([
  '.cjs',
  '.js',
  '.jsx',
  '.mjs',
]);

/**
 * Converts compiler options from JSON to ts.CompilerOptions
 */
export function createCompilerOptions(
  tsConfig: Record<string, unknown> = {},
  fileType?: ConfigFileType,
): ts.CompilerOptions {
  const config = window.ts.convertCompilerOptionsFromJson(
    {
      jsx: 'preserve',
      module: 'esnext',
      target: 'esnext',
      allowJs: fileType !== undefined && javascriptFileTypes.has(fileType),
      ...tsConfig,
      baseUrl: undefined,
      lib: Array.isArray(tsConfig.lib) ? tsConfig.lib : undefined,
      moduleDetection: undefined,
      moduleResolution: undefined,
      paths: undefined,
      plugins: undefined,
      typeRoots: undefined,
    },
    '/tsconfig.json',
  );

  const options = config.options;

  options.lib ??= [window.ts.getDefaultLibFileName(options)];

  return options;
}
