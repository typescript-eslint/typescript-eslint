import type * as ts from 'typescript';

import {
  isTypeAnyType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import * as tsutils from 'ts-api-utils';

import type { ConstraintTypeInfo } from './getConstraintTypeInfo';

export enum Awaitable {
  Always,
  Never,
  May,
}

export function needsToBeAwaited(
  checker: ts.TypeChecker,
  node: ts.Node,
  constraintTypeInfo: ConstraintTypeInfo,
): Awaitable {
  const { constraintType, isTypeParameter } = constraintTypeInfo;

  // unconstrained generic types should be treated as unknown
  if (isTypeParameter && constraintType == null) {
    return Awaitable.May;
  }

  // `any` and `unknown` types may need to be awaited
  if (isTypeAnyType(constraintType) || isTypeUnknownType(constraintType)) {
    return Awaitable.May;
  }

  // 'thenable' values should always be be awaited
  if (tsutils.isThenableType(checker, node, constraintType)) {
    return Awaitable.Always;
  }

  // anything else should not be awaited
  return Awaitable.Never;
}
