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
    category?: { message: string };
    description?: { message: string };
    element?: {
      type: string | Map<string, unknown>;
    };
    name: string;
    type?: string | Map<string, unknown>;
  }

  const optionDeclarations: OptionDeclarations[];
}
