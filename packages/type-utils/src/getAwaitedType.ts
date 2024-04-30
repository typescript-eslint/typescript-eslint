import * as ts from 'typescript';
import * as tsutils from 'ts-api-utils';
import { isPromiseLike } from './builtinSymbolLikes';

export function getAwaitedType(program: ts.Program, type: ts.Type): ts.Type {
  if (isPromiseLike(program, type) && tsutils.isTypeReference(type)) {
    const awaitedType = type.typeArguments?.[0];
    if (awaitedType) {
      return getAwaitedType(program, awaitedType);
    }
  }
  return type;
}
