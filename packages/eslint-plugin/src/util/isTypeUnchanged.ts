import { isTypeFlagSet } from '@typescript-eslint/type-utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

export function isTypeUnchanged(
  compilerOptions: ts.CompilerOptions,
  uncast: ts.Type,
  cast: ts.Type,
): boolean {
  if (uncast === cast) {
    return true;
  }

  if (
    isTypeFlagSet(uncast, ts.TypeFlags.Undefined) &&
    isTypeFlagSet(cast, ts.TypeFlags.Undefined) &&
    tsutils.isCompilerOptionEnabled(
      compilerOptions,
      'exactOptionalPropertyTypes',
    )
  ) {
    const uncastParts = tsutils
      .unionTypeParts(uncast)
      .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

    const castParts = tsutils
      .unionTypeParts(cast)
      .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

    if (uncastParts.length !== castParts.length) {
      return false;
    }

    const uncastPartsSet = new Set(uncastParts);
    return castParts.every(part => uncastPartsSet.has(part));
  }

  return false;
}
