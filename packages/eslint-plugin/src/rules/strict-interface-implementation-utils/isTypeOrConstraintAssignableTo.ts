import type * as ts from 'typescript';

export function isTypeOrConstraintAssignableTo(
  checker: ts.TypeChecker,
  baseType: ts.Type,
  derivedType: ts.Type,
): boolean {
  const baseConstrained =
    baseType.isTypeParameter() && checker.getBaseConstraintOfType(baseType);

  if (baseConstrained == null) {
    return true;
  }

  return checker.isTypeAssignableTo(
    baseConstrained || baseType,
    checker.getBaseConstraintOfType(derivedType) ?? derivedType,
  );
}
