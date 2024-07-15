import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import { isSymbolFromDefaultLibrary } from './isSymbolFromDefaultLibrary';

export function getAwaitedType(
  program: ts.Program,
  checker: ts.TypeChecker,
  type: ts.Type,
  node: ts.Node,
): ts.Type {
  const symbol = type.getSymbol();
  if (
    tsutils.isThenableType(checker, node, type) &&
    tsutils.isTypeReference(type) &&
    isSymbolFromDefaultLibrary(program, symbol) &&
    symbol?.getName() === 'Promise'
  ) {
    const awaitedType = type.typeArguments?.[0];
    if (awaitedType) {
      return getAwaitedType(program, checker, awaitedType, node);
    }
  }
  return type;
}
