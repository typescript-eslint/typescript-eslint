import type * as ts from 'typescript';

export function createCompilerOptions(
  tsConfig: Record<string, unknown> = {},
): ts.CompilerOptions {
  const config = window.ts.convertCompilerOptionsFromJson(
    {
      // ts and monaco has different type as monaco types are not changing base on ts version
      target: 'esnext',
      module: 'esnext',
      jsx: 'preserve',
      ...tsConfig,
      allowJs: true,
      lib: Array.isArray(tsConfig.lib) ? tsConfig.lib : undefined,
      moduleResolution: undefined,
      plugins: undefined,
      typeRoots: undefined,
      paths: undefined,
      moduleDetection: undefined,
      baseUrl: undefined,
    },
    '/tsconfig.json',
  );

  const options = config.options;

  if (!options.lib) {
    options.lib = [window.ts.getDefaultLibFileName(options)];
  }

  return options;
}
