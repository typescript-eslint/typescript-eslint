import 'typescript';

// aliasing because the TS namespace annoyingly declares its own Map type
type StringMap = Map<string, string>;
declare module 'typescript' {
  /**
   * Map of available libraries
   *
   * The key is the key used in compilerOptions.lib
   * The value is the file name
   */
  const libMap: StringMap;
}
