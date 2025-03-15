import type * as ts from 'typescript';

/**
 * Converts compiler options from JSON to ts.CompilerOptions
 */
export function createCompilerOptions(
  tsConfig: Record<string, unknown> = {},
): ts.CompilerOptions {
  const config = window.ts.convertCompilerOptionsFromJson(
    {
      jsx: 'preserve',
      module: 'esnext',
      target: 'esnext',
      ...tsConfig,
      allowJs: true,
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
