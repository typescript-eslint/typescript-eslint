import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

function isIntrinsicPrimitiveType(type: ts.Type): boolean {
  return tsutils.isTypeFlagSet(
    type,
    ts.TypeFlags.BigInt | ts.TypeFlags.Number | ts.TypeFlags.String,
  );
}

export function isTypeBrandedLiteral(type: ts.Type): boolean {
  return (
    type.isIntersection() &&
    type.types.length === 2 &&
    type.types.some(isIntrinsicPrimitiveType) &&
    type.types.some(subType => tsutils.isObjectType(subType))
  );
}
