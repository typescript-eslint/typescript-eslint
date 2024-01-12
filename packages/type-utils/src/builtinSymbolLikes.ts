import * as ts from 'typescript';

import { isSymbolFromDefaultLibrary } from './isSymbolFromDefaultLibrary';

/**
 * class Foo extends Promise<number> {}
 * Foo.reject
 *  ^ PromiseLike
 */
export function isPromiseLike(program: ts.Program, type: ts.Type): boolean {
  return isBuiltinSymbolLike(
    program,
    type,
    symbolName => symbolName === 'Promise',
  );
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
  return isBuiltinSymbolLike(
    program,
    type,
    symbolName => symbolName === 'PromiseConstructor',
  );
}

/**
 * class Foo extends Error {}
 * new Foo()
 *      ^ ErrorLike
 */
export function isErrorLike(program: ts.Program, type: ts.Type): boolean {
  return isBuiltinSymbolLike(
    program,
    type,
    symbolName => symbolName === 'Error',
  );
}

/**
 * type T = Readonly<Error>
 *      ^ ReadonlyErrorLike
 */
export function isReadonlyErrorLike(
  program: ts.Program,
  type: ts.Type,
): boolean {
  return isReadonlyTypeLike(program, type, subtype => {
    const [typeArgument] = subtype.aliasTypeArguments;
    return (
      isErrorLike(program, typeArgument) ||
      isReadonlyErrorLike(program, typeArgument)
    );
  });
}

/**
 * type T = Readonly<{ foo: 'bar' }>
 *      ^ ReadonlyTypeLike
 */
export function isReadonlyTypeLike(
  program: ts.Program,
  type: ts.Type,
  predicate?: (
    subType: ts.Type & {
      aliasSymbol: ts.Symbol;
      aliasTypeArguments: readonly ts.Type[];
    },
  ) => boolean,
): boolean {
  return isBuiltinTypeAliasLike(program, type, subtype => {
    return (
      subtype.aliasSymbol.getName() === 'Readonly' && !!predicate?.(subtype)
    );
  });
}
export function isBuiltinTypeAliasLike(
  program: ts.Program,
  type: ts.Type,
  predicate: (
    subType: ts.Type & {
      aliasSymbol: ts.Symbol;
      aliasTypeArguments: readonly ts.Type[];
    },
  ) => boolean,
): boolean {
  return isBuiltinSymbolLikeRecurser(program, type, subtype => {
    const { aliasSymbol, aliasTypeArguments } = subtype;

    if (!aliasSymbol || !aliasTypeArguments) {
      return false;
    }

    if (
      isSymbolFromDefaultLibrary(program, aliasSymbol) &&
      predicate(
        subtype as ts.Type & {
          aliasSymbol: ts.Symbol;
          aliasTypeArguments: readonly ts.Type[];
        },
      )
    ) {
      return true;
    }

    return null;
  });
}

export function isBuiltinSymbolLike(
  program: ts.Program,
  type: ts.Type,
  predicate: (symbolName: string) => boolean,
): boolean {
  return isBuiltinSymbolLikeRecurser(program, type, subType => {
    const symbol = subType.getSymbol();
    if (!symbol) {
      return false;
    }

    if (
      predicate(symbol.getName()) &&
      isSymbolFromDefaultLibrary(program, symbol)
    ) {
      return true;
    }

    return null;
  });
}

export function isBuiltinSymbolLikeRecurser(
  program: ts.Program,
  type: ts.Type,
  predicate: (subType: ts.Type) => boolean | null,
): boolean {
  if (type.isIntersection()) {
    return type.types.some(t =>
      isBuiltinSymbolLikeRecurser(program, t, predicate),
    );
  }
  if (type.isUnion()) {
    return type.types.every(t =>
      isBuiltinSymbolLikeRecurser(program, t, predicate),
    );
  }

  const predicateResult = predicate(type);
  if (typeof predicateResult === 'boolean') {
    return predicateResult;
  }

  const symbol = type.getSymbol();
  if (
    symbol &&
    symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)
  ) {
    const checker = program.getTypeChecker();
    for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
      if (isBuiltinSymbolLikeRecurser(program, baseType, predicate)) {
        return true;
      }
    }
  }
  return false;
}
