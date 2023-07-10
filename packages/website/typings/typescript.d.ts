import 'typescript';

declare module 'typescript' {
  /**
   * Map of available libraries
   *
   * The key is the key used in compilerOptions.lib
   * The value is the file name
   */
  const libMap: Map<string, string>;

  interface OptionDeclarations {
    name: string;
    type?: unknown;
    category?: { message: string };
    description?: { message: string };
    element?: {
      type: unknown;
    };
  }

  const optionDeclarations: OptionDeclarations[];
}
