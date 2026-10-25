import 'typescript';

declare module 'typescript' {
  interface TypeChecker {
    // internal TS APIs

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

  interface Type {
    /**
     * @deprecated don't use this directly as it does not include bigint literals pre-5.0; instead use isTypeLiteralType from `@typescript-eslint/type-utils`.
     */
    isLiteral(): this is LiteralType;
  }
}
