import { TypeChecker, Type } from 'typescript';

declare module 'typescript' {
  interface TypeChecker {
    // internal TS APIs

    /**
     * @returns `true` if the given type is an array type:
     * - Array<foo>
     * - ReadonlyArray<foo>
     * - foo[]
     * - readonly foo[]
     */
    isArrayType(type: Type): boolean;
    /**
     * @returns `true` if the given type is a tuple type:
     * - [foo]
     */
    isTupleType(type: Type): boolean;
  }
}
