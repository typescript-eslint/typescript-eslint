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
  // `any` and `unknown` types may need to be awaited
  if (isTypeAnyType(type) || isTypeUnknownType(type)) {
    return Awaitable.May;
  }

  // 'thenable' values should always be be awaited
  if (tsutils.isThenableType(checker, node, type)) {
    return Awaitable.Always;
  }

  // recurse into a type parameter constraint
  if (tsutils.isTypeParameter(type)) {
    const constraint = type.getConstraint();

    // if there's no constraint, this may need to be awaited
    if (!constraint) {
      return Awaitable.May;
    }

    return needsToBeAwaited(checker, node, constraint);
  }

  // anything else should not be awaited
  return Awaitable.Never;
}
