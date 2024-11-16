import type * as ts from 'typescript';

import {
  isTypeAnyType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import * as tsutils from 'ts-api-utils';

export enum Awaitable {
  Always,
  Never,
  May,
}

export function needsToBeAwaited(
  checker: ts.TypeChecker,
  node: ts.Node,
  type: ts.Type,
): Awaitable {
  // can't use `getConstrainedTypeAtLocation` directly since it's bugged for
  // unconstrained generics.
  const constrainedType = !tsutils.isTypeParameter(type)
    ? type
    : checker.getBaseConstraintOfType(type);

  // unconstrained generic types should be treated as unknown
  if (constrainedType == null) {
    return Awaitable.May;
  }

  // `any` and `unknown` types may need to be awaited
  if (isTypeAnyType(constrainedType) || isTypeUnknownType(constrainedType)) {
    return Awaitable.May;
  }

  // 'thenable' values should always be be awaited
  if (tsutils.isThenableType(checker, node, constrainedType)) {
    return Awaitable.Always;
  }

  // anything else should not be awaited
  return Awaitable.Never;
}
