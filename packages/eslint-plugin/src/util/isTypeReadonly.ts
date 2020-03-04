import {
  isObjectType,
  isUnionType,
  isUnionOrIntersectionType,
  unionTypeParts,
  isPropertyReadonlyInType,
} from 'tsutils';
import * as ts from 'typescript';
import { nullThrows, NullThrowsReasons } from '.';

const enum Readonlyness {
  /** the type cannot be handled by the function */
  UnknownType = 1,
  /** the type is mutable */
  Mutable = 2,
  /** the type is readonly */
  Readonly = 3,
}

function isTypeReadonlyArrayOrTuple(
  checker: ts.TypeChecker,
  type: ts.Type,
  seenTypes: Set<ts.Type>,
): Readonlyness {
  function checkTypeArguments(arrayType: ts.TypeReference): Readonlyness {
    const typeArguments = checker.getTypeArguments(arrayType);
    // this shouldn't happen in reality as:
    // - tuples require at least 1 type argument
    // - ReadonlyArray requires at least 1 type argument
    /* istanbul ignore if */ if (typeArguments.length === 0) {
      return Readonlyness.Readonly;
    }

    // validate the element types are also readonly
    if (
      typeArguments.some(
        typeArg =>
          isTypeReadonlyRecurser(checker, typeArg, seenTypes) ===
          Readonlyness.Mutable,
      )
    ) {
      return Readonlyness.Mutable;
    }
    return Readonlyness.Readonly;
  }

  if (checker.isArrayType(type)) {
    const symbol = nullThrows(
      type.getSymbol(),
      NullThrowsReasons.MissingToken('symbol', 'array type'),
    );
    const escapedName = symbol.getEscapedName();
    if (escapedName === 'Array') {
      return Readonlyness.Mutable;
    }

    return checkTypeArguments(type);
  }

  if (checker.isTupleType(type)) {
    if (!type.target.readonly) {
      return Readonlyness.Mutable;
    }

    return checkTypeArguments(type);
  }

  return Readonlyness.UnknownType;
}

function isTypeReadonlyObject(
  checker: ts.TypeChecker,
  type: ts.Type,
  seenTypes: Set<ts.Type>,
): Readonlyness {
  function checkIndexSignature(kind: ts.IndexKind): Readonlyness {
    const indexInfo = checker.getIndexInfoOfType(type, kind);
    if (indexInfo) {
      return indexInfo.isReadonly
        ? Readonlyness.Readonly
        : Readonlyness.Mutable;
    }

    return Readonlyness.UnknownType;
  }

  const properties = type.getProperties();
  if (properties.length) {
    // ensure the properties are marked as readonly
    for (const property of properties) {
      if (!isPropertyReadonlyInType(type, property.getEscapedName(), checker)) {
        return Readonlyness.Mutable;
      }
    }

    // all properties were readonly
    // now ensure that all of the values are readonly also.

    // do this after checking property readonly-ness as a perf optimization,
    // as we might be able to bail out early due to a mutable property before
    // doing this deep, potentially expensive check.
    for (const property of properties) {
      const propertyType = nullThrows(
        checker.getTypeOfPropertyOfType(type, property.getName()),
        NullThrowsReasons.MissingToken(`property "${property.name}"`, 'type'),
      );

      // handle recursive types.
      // we only need this simple check, because a mutable recursive type will break via the above prop readonly check
      if (seenTypes.has(propertyType)) {
        continue;
      }

      if (
        isTypeReadonlyRecurser(checker, propertyType, seenTypes) ===
        Readonlyness.Mutable
      ) {
        return Readonlyness.Mutable;
      }
    }
  }

  const isStringIndexSigReadonly = checkIndexSignature(ts.IndexKind.String);
  if (isStringIndexSigReadonly === Readonlyness.Mutable) {
    return isStringIndexSigReadonly;
  }

  const isNumberIndexSigReadonly = checkIndexSignature(ts.IndexKind.Number);
  if (isNumberIndexSigReadonly === Readonlyness.Mutable) {
    return isNumberIndexSigReadonly;
  }

  return Readonlyness.Readonly;
}

// a helper function to ensure the seenTypes map is always passed down, except by the external caller
function isTypeReadonlyRecurser(
  checker: ts.TypeChecker,
  type: ts.Type,
  seenTypes: Set<ts.Type>,
): Readonlyness.Readonly | Readonlyness.Mutable {
  seenTypes.add(type);

  if (isUnionType(type)) {
    // all types in the union must be readonly
    const result = unionTypeParts(type).every(t =>
      isTypeReadonlyRecurser(checker, t, seenTypes),
    );
    const readonlyness = result ? Readonlyness.Readonly : Readonlyness.Mutable;
    return readonlyness;
  }

  // all non-object, non-intersection types are readonly.
  // this should only be primitive types
  if (!isObjectType(type) && !isUnionOrIntersectionType(type)) {
    return Readonlyness.Readonly;
  }

  // pure function types are readonly
  if (
    type.getCallSignatures().length > 0 &&
    type.getProperties().length === 0
  ) {
    return Readonlyness.Readonly;
  }

  const isReadonlyArray = isTypeReadonlyArrayOrTuple(checker, type, seenTypes);
  if (isReadonlyArray !== Readonlyness.UnknownType) {
    return isReadonlyArray;
  }

  const isReadonlyObject = isTypeReadonlyObject(checker, type, seenTypes);
  /* istanbul ignore else */ if (
    isReadonlyObject !== Readonlyness.UnknownType
  ) {
    return isReadonlyObject;
  }

  throw new Error('Unhandled type');
}

/**
 * Checks if the given type is readonly
 */
function isTypeReadonly(checker: ts.TypeChecker, type: ts.Type): boolean {
  return (
    isTypeReadonlyRecurser(checker, type, new Set()) === Readonlyness.Readonly
  );
}

export { isTypeReadonly };
