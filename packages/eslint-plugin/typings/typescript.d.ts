import 'typescript';

declare module 'typescript' {
  interface TypeChecker {
    // internal TS APIs

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
    /**
     * Return the type of the given property in the given type, or undefined if no such property exists
     */
    getTypeOfPropertyOfType(type: Type, propertyName: string): Type | undefined;
  }

  interface Type {
    /**
     * If the type is `any`, and this is set to "error", then TS was unable to resolve the type
     */
    intrinsicName?: string;
  }
}
