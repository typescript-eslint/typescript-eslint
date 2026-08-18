import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';

export interface PropertyKeyMatching {
  propertyKeyTypesMayOverlap: (
    propertyKey: ts.Type,
    indexKey: ts.Type,
  ) => boolean;
  stringPropertyMatchesIndexKey: (value: string, indexKey: ts.Type) => boolean;
}

type PropertyKeyMatchingState = Pick<
  AnalysisState,
  'checker' | 'isDeferredType' | 'isTypeAssignableTo' | 'isUncertain'
>;

export function createPropertyKeyMatching(
  state: PropertyKeyMatchingState,
): PropertyKeyMatching {
  const { checker, isDeferredType, isTypeAssignableTo, isUncertain } = state;

  /**
   * Whether any reachable constituent is deferred or a bare
   * type parameter, making key comparisons inconclusive.
   */
  function typeContainsDeferredConstituent(
    type: ts.Type,
    seen = new Set<ts.Type>(),
  ): boolean {
    if (seen.has(type)) {
      return true;
    }
    if (isDeferredType(type) || tsutils.isTypeParameter(type)) {
      return true;
    }

    seen.add(type);
    if (type.isUnion() || type.isIntersection()) {
      return type.types.some(member =>
        typeContainsDeferredConstituent(member, seen),
      );
    }
    if (tsutils.isTemplateLiteralType(type)) {
      return type.types.some(member =>
        typeContainsDeferredConstituent(member, seen),
      );
    }
    if (tsutils.isStringMappingType(type)) {
      return typeContainsDeferredConstituent(type.type, seen);
    }
    return (
      type.aliasTypeArguments?.some(member =>
        typeContainsDeferredConstituent(member, seen),
      ) === true
    );
  }

  /**
   * Whether a concrete property name can satisfy an index signature's key
   * type, using the checker's own assignability relation.
   */
  function stringPropertyMatchesIndexKey(
    value: string,
    indexKey: ts.Type,
  ): boolean {
    if (
      typeof checker.getStringLiteralType !== 'function' ||
      typeof checker.getNumberLiteralType !== 'function'
    ) {
      // TypeScript before 5.1 cannot construct literal key types, so the
      // assignability comparison below is unavailable. Treating the key as
      // possibly covered only suppresses diagnostics on those runtimes.
      return true;
    }

    // The checker's own assignability relation covers every index key form,
    // including template literal types and intrinsic string mappings.
    if (isTypeAssignableTo(checker.getStringLiteralType(value), indexKey)) {
      return true;
    }

    if (
      tsutils.isNumericPropertyName(value) &&
      isTypeAssignableTo(checker.getNumberLiteralType(Number(value)), indexKey)
    ) {
      return true;
    }

    if (!typeContainsDeferredConstituent(indexKey)) {
      return false;
    }

    const constraint = checker.getBaseConstraintOfType(indexKey);
    return (
      constraint == null ||
      constraint === indexKey ||
      isUncertain(constraint) ||
      stringPropertyMatchesIndexKey(value, constraint)
    );
  }

  /**
   * Conservative overlap test for two key types; uncertainty counts as
   * overlap so a possible collision is never ruled out.
   */
  function propertyKeyTypesMayOverlap(
    propertyKey: ts.Type,
    indexKey: ts.Type,
  ): boolean {
    if (propertyKey.isUnion()) {
      return propertyKey.types.some(member =>
        propertyKeyTypesMayOverlap(member, indexKey),
      );
    }
    if (indexKey.isUnion()) {
      return indexKey.types.some(member =>
        propertyKeyTypesMayOverlap(propertyKey, member),
      );
    }
    if (
      isUncertain(propertyKey) ||
      isUncertain(indexKey) ||
      isDeferredType(propertyKey) ||
      isDeferredType(indexKey) ||
      tsutils.isTypeParameter(propertyKey) ||
      tsutils.isTypeParameter(indexKey)
    ) {
      return true;
    }
    if (
      isTypeAssignableTo(propertyKey, indexKey) ||
      isTypeAssignableTo(indexKey, propertyKey)
    ) {
      return true;
    }

    const symbolFlags = ts.TypeFlags.ESSymbol | ts.TypeFlags.UniqueESSymbol;
    if (
      tsutils.isTypeFlagSet(propertyKey, symbolFlags) ||
      tsutils.isTypeFlagSet(indexKey, symbolFlags)
    ) {
      return false;
    }

    if (
      tsutils.isStringLiteralType(propertyKey) &&
      tsutils.isTypeFlagSet(
        indexKey,
        ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral,
      )
    ) {
      return stringPropertyMatchesIndexKey(propertyKey.value, indexKey);
    }
    if (
      tsutils.isStringLiteralType(indexKey) &&
      tsutils.isTypeFlagSet(
        propertyKey,
        ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral,
      )
    ) {
      return stringPropertyMatchesIndexKey(indexKey.value, propertyKey);
    }

    const stringFlags =
      ts.TypeFlags.String |
      ts.TypeFlags.StringLiteral |
      ts.TypeFlags.StringMapping |
      ts.TypeFlags.TemplateLiteral;
    const numberFlags = ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral;
    return (
      tsutils.isTypeFlagSet(propertyKey, stringFlags | numberFlags) &&
      tsutils.isTypeFlagSet(indexKey, stringFlags | numberFlags)
    );
  }

  return { propertyKeyTypesMayOverlap, stringPropertyMatchesIndexKey };
}
