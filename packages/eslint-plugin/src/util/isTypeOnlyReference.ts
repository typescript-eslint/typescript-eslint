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
    variable.defs.some(def => def.type === DefinitionType.Variable) &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- no-unused-vars is one of our rare rules that's used across JS code that is not parsed by our parser. As such `isValueReference` may be undefined and using `!isValueReference` causes false-positives for those users.
    ref.isValueReference === false
  );
}
