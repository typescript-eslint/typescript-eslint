import * as ts from 'typescript';

import { isSymbolFromDefaultLibrary } from './isSymbolFromDefaultLibrary';

/**
 * class Foo extends Promise<number> {}
 * Foo.reject
 *  ^ PromiseLike
 */
export function isPromiseLike(program: ts.Program, type: ts.Type): boolean {
  return isBuiltinSymbolLike(program, type, 'Promise');
}

/**
 * const foo = Promise
 * foo.reject
 *  ^ PromiseConstructorLike
 */
export function isPromiseConstructorLike(
  program: ts.Program,
  type: ts.Type,
): boolean {
  return isBuiltinSymbolLike(program, type, 'PromiseConstructor');
}

/**
 * class Foo extends Error {}
 * new Foo()
 *      ^ ErrorLike
 */
export function isErrorLike(program: ts.Program, type: ts.Type): boolean {
  return isBuiltinSymbolLike(program, type, 'Error');
}

export function isBuiltinSymbolLike(
  program: ts.Program,
  type: ts.Type,
  symbolName: string,
): boolean {
  if (type.isIntersection()) {
    return type.types.some(t => isBuiltinSymbolLike(program, t, symbolName));
  }
  if (type.isUnion()) {
    return type.types.every(t => isBuiltinSymbolLike(program, t, symbolName));
  }

  const symbol = type.getSymbol();
  if (!symbol) {
    return false;
  }

  if (
    symbol.getName() === symbolName &&
    isSymbolFromDefaultLibrary(program, symbol)
  ) {
    return true;
  }

  if (symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
    const checker = program.getTypeChecker();

    for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
      if (isBuiltinSymbolLike(program, baseType, symbolName)) {
        return true;
      }
    }
  }

  return false;
}
