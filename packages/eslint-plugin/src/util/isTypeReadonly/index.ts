import {
  isObjectType,
  isUnionType,
  isUnionOrIntersectionType,
  unionTypeParts,
} from 'tsutils';
import * as ts from 'typescript';
import { nullThrows, NullThrowsReasons } from '..';
import { isReadonlySymbol } from './isReadonlySymbol';

/**
 * Returns:
 * - null if the type is not an array or tuple,
 * - true if the type is a readonly array or readonly tuple,
 * - false if the type is a mutable array or mutable tuple.
 */
function isTypeReadonlyArrayOrTuple(
  checker: ts.TypeChecker,
  type: ts.Type,
): boolean | null {
  function checkTypeArguments(arrayType: ts.TypeReference): boolean {
    const typeArguments = checker.getTypeArguments(arrayType);
    if (typeArguments.length === 0) {
      // this shouldn't happen in reality as:
      // - tuples require at least 1 type argument
      // - ReadonlyArray requires at least 1 type argument
      return true;
    }

    // validate the element types are also readonly
    if (typeArguments.some(typeArg => !isTypeReadonly(checker, typeArg))) {
      return false;
    }
    return true;
  }

  if (checker.isArrayType(type)) {
    const symbol = nullThrows(
      type.getSymbol(),
      NullThrowsReasons.MissingToken('symbol', 'array type'),
    );
    const escapedName = symbol.getEscapedName();
    if (escapedName === 'Array' && escapedName !== 'ReadonlyArray') {
      return false;
    }

    return checkTypeArguments(type);
  }

  if (checker.isTupleType(type)) {
    if (!type.target.readonly) {
      return false;
    }

    return checkTypeArguments(type);
  }

  return null;
}

/**
 * Returns:
 * - null if the type is not an object,
 * - true if the type is an object with only readonly props,
 * - false if the type is an object with at least one mutable prop.
 */
function isTypeReadonlyObject(
  checker: ts.TypeChecker,
  type: ts.Type,
): boolean | null {
  function checkIndexSignature(kind: ts.IndexKind): boolean | null {
    const indexInfo = checker.getIndexInfoOfType(type, kind);
    if (indexInfo) {
      return indexInfo.isReadonly ? true : false;
    }

    return null;
  }

  const properties = type.getProperties();
  if (properties.length) {
    for (const property of properties) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const x = checker.isReadonlySymbol(property);
      const y = isReadonlySymbol(property);
      if (x !== y) {
        throw new Error('FUCK');
      }
      if (!isReadonlySymbol(property)) {
        return false;
      }
    }

    // all properties were readonly
  }

  const isStringIndexSigReadonly = checkIndexSignature(ts.IndexKind.String);
  if (isStringIndexSigReadonly === false) {
    return isStringIndexSigReadonly;
  }

  const isNumberIndexSigReadonly = checkIndexSignature(ts.IndexKind.Number);
  if (isNumberIndexSigReadonly === false) {
    return isNumberIndexSigReadonly;
  }

  return true;
}

/**
 * Checks if the given type is readonly
 */
function isTypeReadonly(checker: ts.TypeChecker, type: ts.Type): boolean {
  if (isUnionType(type)) {
    // all types in the union must be readonly
    return unionTypeParts(type).every(t => isTypeReadonly(checker, t));
  }

  // all non-object, non-intersection types are readonly.
  // this should only be primitive types
  if (!isObjectType(type) && !isUnionOrIntersectionType(type)) {
    return true;
  }

  // pure function types are readonly
  if (
    type.getCallSignatures().length > 0 &&
    type.getProperties().length === 0
  ) {
    return true;
  }

  const isReadonlyArray = isTypeReadonlyArrayOrTuple(checker, type);
  if (isReadonlyArray !== null) {
    return isReadonlyArray;
  }

  const isReadonlyObject = isTypeReadonlyObject(checker, type);
  if (isReadonlyObject !== null) {
    return isReadonlyObject;
  }

  throw new Error('Unhandled type');
}

export { isTypeReadonly };
