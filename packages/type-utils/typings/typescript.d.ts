import 'typescript';

declare module 'typescript' {
  interface TypeChecker {
    // internal TS APIs

    /**
     * Return the awaited type of the given type.
     *
     * TODO: Remove when it's exposed as a public API.
     * https://github.com/microsoft/TypeScript/issues/59256
     */
    getAwaitedType(type: Type): Type | undefined;
    /**
     * Return the type of the given property in the given type, or undefined if no such property exists
     */
    getTypeOfPropertyOfType(type: Type, propertyName: string): Type | undefined;
    /**
     * @returns `true` if the given type is an array type:
     * - `Array<foo>`
     * - `ReadonlyArray<foo>`
     * - `foo[]`
     * - `readonly foo[]`
     */
    isArrayType(type: Type): type is TypeReference;
    /**
     * @returns `true` if the given type is a tuple type:
     * - `[foo]`
     * - `readonly [foo]`
     */
    isTupleType(type: Type): type is TupleTypeReference;
  }

  interface Type {
    /**
     * If the type is `any`, and this is set to "error", then TS was unable to resolve the type
     */
    intrinsicName?: string;
  }

  interface Program {
    /**
     * Maps from a SourceFile's `.path` to the name of the package it was imported with.
     */
    readonly sourceFileToPackageName: ReadonlyMap<Path, string>;
  }

  interface SourceFile extends Declaration, LocalsContainer {
    path: Path;
  }
}
