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
 * Returns whether the type is a **direct** type parameter and what its constraint is.
 *
 * If the type is not a type parameter, `isTypeParameter` will be `false`, and
 * `constraintType` will be the same as the input type.
 *
 * If the type is a type parameter, and it is constrained, `isTypeParameter` will be
 * `true`, and `constraintType` will be the constraint type.
 *
 * If the type is a type parameter, but it is not constrained, `constraintType` will be
 * `undefined` (rather than an `unknown` type), due to https://github.com/microsoft/TypeScript/issues/60475
 *
 * This helper only recognizes types for which {@link tsutils.isTypeParameter} is
 * `true`. Other shapes that still involve type variables often need separate
 * handling by callers — for example:
 *
 * - {@link https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts | Indexed access types} such as `T[K]` (e.g. the type of `arg[key]` when `arg` is `T` and `key` is `keyof T`)
 * - Union or intersection types whose constituents include type parameters (e.g. `T | []`)
 *
 * Those cases typically yield `isTypeParameter: false` with `constraintType` equal to
 * the full input type. Rules that must treat “contains an unconstrained type variable”
 * differently from ordinary types should inspect the type further (e.g. union members,
 * `TypeFlags.TypeVariable`, or indexed access object/index types). See
 * https://github.com/typescript-eslint/typescript-eslint/issues/10606
 *
 * Successor to {@link getConstrainedTypeAtLocation} due to https://github.com/typescript-eslint/typescript-eslint/issues/10438
 *
 * This is considered internal since it is unstable for now and may have breaking changes at any time.
 * Use at your own risk.
 *
 * @internal
 *
 */
export function getConstraintInfo(
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
