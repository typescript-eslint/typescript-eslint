import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

export function getAwaitedType(
  checker: ts.TypeChecker,
  type: ts.Type,
  node: ts.Node,
): ts.Type {
  if (
    tsutils.isThenableType(checker, node, type) &&
    tsutils.isTypeReference(type)
  ) {
    const awaitedType = type.typeArguments?.[0];
    if (awaitedType) {
      return getAwaitedType(checker, awaitedType, node);
    }
  }
  return type;
}
