import type { ScopeVariable } from '@typescript-eslint/scope-manager';
import type { TSESLint } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';

import { referenceContainsTypePredicate } from './referenceContainsTypePredicate';
import { referenceContainsTypeQuery } from './referenceContainsTypeQuery';

export function isMergedTypeValueVariable(variable: ScopeVariable): boolean {
  return (
    'isTypeVariable' in variable &&
    'isValueVariable' in variable &&
    variable.isTypeVariable &&
    variable.isValueVariable
  );
}

/**
 * Whether a reference is a type-only usage (e.g. `typeof x`, a type predicate,
 * or a type-position reference to a merged type/value name like
 * `interface A` + `const A`).
 *
 * Such references should not keep a value binding from being reported unused /
 * used-only-as-type.
 */
export function isTypeOnlyReference(
  variable: ScopeVariable,
  ref: TSESLint.Scope.Reference,
): boolean {
  if (
    referenceContainsTypeQuery(ref.identifier) ||
    referenceContainsTypePredicate(ref.identifier)
  ) {
    return true;
  }

  return (
    isMergedTypeValueVariable(variable) &&
    variable.defs.some(def => def.type === DefinitionType.Variable) &&
    ref.isTypeReference &&
    !ref.isValueReference
  );
}
