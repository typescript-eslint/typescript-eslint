import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

export interface ConstraintTypeInfoUnconstrained {
  constraintType: undefined;
  isTypeParameter: true;
}

export interface ConstraintTypeInfoConstrained {
  constraintType: ts.Type;
  isTypeParameter: true;
}

export interface ConstraintTypeInfoNonGeneric {
  constraintType: ts.Type;
  isTypeParameter: false;
}

export type ConstraintTypeInfo =
  | ConstraintTypeInfoConstrained
  | ConstraintTypeInfoNonGeneric
  | ConstraintTypeInfoUnconstrained;

/**
 * Resolves the given node's type, and returns info about whether it is a generic or ordinary type.
 *
 * Successor to {@link getConstrainedTypeAtLocation} due to https://github.com/typescript-eslint/typescript-eslint/issues/10438
 *
 * This is considered internal since it is unstable for now and may have breaking changes at any time.
 * Use at your own risk.
 *
 * @internal
 *
 */
export function getConstraintTypeInfo(
  checker: ts.TypeChecker,
  type: ts.Type,
): ConstraintTypeInfo {
  if (tsutils.isTypeParameter(type)) {
    const constraintType = checker.getBaseConstraintOfType(type);
    return {
      constraintType,
      isTypeParameter: true,
    };
  }
  return {
    constraintType: type,
    isTypeParameter: false,
  };
}
