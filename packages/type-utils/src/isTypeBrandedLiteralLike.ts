import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

function isLiteralOrTaggablePrimitiveLike(type: ts.Type): boolean {
  if (tsutils.isUnionOrIntersectionType(type)) {
    return type.types.every(isLiteralOrTaggablePrimitiveLike);
  }

  return (
    type.isLiteral() ||
    tsutils.isTypeFlagSet(
      type,
      ts.TypeFlags.BigInt | ts.TypeFlags.Number | ts.TypeFlags.String,
    )
  );
}

function isObjectLiteralLike(type: ts.Type): boolean {
  if (tsutils.isUnionOrIntersectionType(type)) {
    return type.types.every(isObjectLiteralLike);
  }

  if (type.getCallSignatures().length || type.getConstructSignatures().length) {
    return false;
  }

  return tsutils.isObjectType(type);
}

function isTypeBrandedLiteral(type: ts.Type): boolean {
  if (!type.isIntersection()) {
    return false;
  }

  let hadObjectLike = false;
  let hadPrimitiveLike = false;

  for (const constituent of type.types) {
    if (isObjectLiteralLike(constituent)) {
      hadPrimitiveLike = true;
    } else if (isLiteralOrTaggablePrimitiveLike(constituent)) {
      hadObjectLike = true;
    } else {
      return false;
    }
  }

  return hadPrimitiveLike && hadObjectLike;
}

export function isTypeBrandedLiteralLike(type: ts.Type): boolean {
  return type.isUnion()
    ? type.types.some(isTypeBrandedLiteral)
    : isTypeBrandedLiteral(type);
}
