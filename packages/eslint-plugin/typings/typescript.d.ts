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

    getContextualTypeForArgumentAtIndex(node: Node, argIndex: number): Type;

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
}
