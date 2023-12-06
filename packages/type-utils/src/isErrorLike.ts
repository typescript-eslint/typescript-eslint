import * as ts from 'typescript';

import { isSymbolFromDefaultLibrary } from './isSymbolFromDefaultLibrary';

export function isErrorLike(program: ts.Program, type: ts.Type): boolean {
  if (type.isIntersection()) {
    return type.types.some(t => isErrorLike(program, t));
  }
  if (type.isUnion()) {
    return type.types.every(t => isErrorLike(program, t));
  }

  const symbol = type.getSymbol();
  if (!symbol) {
    return false;
  }

  if (isSymbolFromDefaultLibrary(program, symbol, 'Error')) {
    return true;
  }

  if (symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
    const checker = program.getTypeChecker();

    for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
      if (isErrorLike(program, baseType)) {
        return true;
      }
    }
  }

  return false;
}
