import debug from 'debug';
import * as ts from 'typescript';

import { getTypeFlags, isTypeFlagSet, unionTypeParts } from './';
import { getTypeArguments } from './getTypeArguments';

const log = debug('typescript-eslint:eslint-plugin:utils:types');

/**
 * Checks if the given type is (or accepts) nullable
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isNullableType(
  type: ts.Type,
  {
    isReceiver = false,
    allowUndefined = true,
  }: { isReceiver?: boolean; allowUndefined?: boolean } = {},
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (allowUndefined) {
    return (flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
  } else {
    return (flags & ts.TypeFlags.Null) !== 0;
  }
}

/**
 * Checks if the given type is either an array type,
 * or a union made up solely of array types.
 */
export function isTypeArrayTypeOrUnionOfArrayTypes(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  for (const t of unionTypeParts(type)) {
    if (!checker.isArrayType(t)) {
      return false;
    }
  }

  return true;
}

/**
 * @returns true if the type is `never`
 */
export function isTypeNeverType(type: ts.Type): boolean {
  return isTypeFlagSet(type, ts.TypeFlags.Never);
}

/**
 * @returns true if the type is `unknown`
 */
export function isTypeUnknownType(type: ts.Type): boolean {
  return isTypeFlagSet(type, ts.TypeFlags.Unknown);
}

// https://github.com/microsoft/TypeScript/blob/42aa18bf442c4df147e30deaf27261a41cbdc617/src/compiler/types.ts#L5157
const Nullable = ts.TypeFlags.Undefined | ts.TypeFlags.Null;
// https://github.com/microsoft/TypeScript/blob/42aa18bf442c4df147e30deaf27261a41cbdc617/src/compiler/types.ts#L5187
const ObjectFlagsType =
  ts.TypeFlags.Any |
  Nullable |
  ts.TypeFlags.Never |
  ts.TypeFlags.Object |
  ts.TypeFlags.Union |
  ts.TypeFlags.Intersection;
export function isTypeReferenceType(type: ts.Type): type is ts.TypeReference {
  if ((type.flags & ObjectFlagsType) === 0) {
    return false;
  }
  const objectTypeFlags = (type as ts.ObjectType).objectFlags;
  return (objectTypeFlags & ts.ObjectFlags.Reference) !== 0;
}

/**
 * @returns true if the type is `any`
 */
export function isTypeAnyType(type: ts.Type): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any)) {
    if (type.intrinsicName === 'error') {
      log('Found an "error" any type');
    }
    return true;
  }
  return false;
}

/**
 * @returns true if the type is `any[]`
 */
export function isTypeAnyArrayType(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  return (
    checker.isArrayType(type) &&
    isTypeAnyType(
      // getTypeArguments was only added in TS3.7
      getTypeArguments(type, checker)[0],
    )
  );
}

/**
 * @returns true if the type is `unknown[]`
 */
export function isTypeUnknownArrayType(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  return (
    checker.isArrayType(type) &&
    isTypeUnknownType(
      // getTypeArguments was only added in TS3.7
      getTypeArguments(type, checker)[0],
    )
  );
}

export enum AnyType {
  Any,
  AnyArray,
  Safe,
}
/**
 * @returns `AnyType.Any` if the type is `any`, `AnyType.AnyArray` if the type is `any[]` or `readonly any[]`,
 *          otherwise it returns `AnyType.Safe`.
 */
export function isAnyOrAnyArrayTypeDiscriminated(
  node: ts.Node,
  checker: ts.TypeChecker,
): AnyType {
  const type = checker.getTypeAtLocation(node);
  if (isTypeAnyType(type)) {
    return AnyType.Any;
  }
  if (isTypeAnyArrayType(type, checker)) {
    return AnyType.AnyArray;
  }
  return AnyType.Safe;
}

/**
 * @returns Whether a type is an instance of the parent type, including for the parent's base types.
 */
export function typeIsOrHasBaseType(
  type: ts.Type,
  parentType: ts.Type,
): boolean {
  const parentSymbol = parentType.getSymbol();
  if (!type.getSymbol() || !parentSymbol) {
    return false;
  }

  const typeAndBaseTypes = [type];
  const ancestorTypes = type.getBaseTypes();

  if (ancestorTypes) {
    typeAndBaseTypes.push(...ancestorTypes);
  }

  for (const baseType of typeAndBaseTypes) {
    const baseSymbol = baseType.getSymbol();
    if (baseSymbol && baseSymbol.name === parentSymbol.name) {
      return true;
    }
  }

  return false;
}

export function isTypeBigIntLiteralType(
  type: ts.Type,
): type is ts.BigIntLiteralType {
  return isTypeFlagSet(type, ts.TypeFlags.BigIntLiteral);
}

export function isTypeTemplateLiteralType(
  type: ts.Type,
): type is ts.TemplateLiteralType {
  return isTypeFlagSet(type, ts.TypeFlags.TemplateLiteral);
}
