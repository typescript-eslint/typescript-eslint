import type * as ts from 'typescript';

const valueIsPseudoBigInt = (
  value: number | string | ts.PseudoBigInt,
): value is ts.PseudoBigInt => {
  return typeof value === 'object';
};

const pseudoBigIntToBigInt = (value: ts.PseudoBigInt): bigint => {
  return BigInt((value.negative ? '-' : '') + value.base10Value);
};

export const getValueOfLiteralType = (
  type: ts.LiteralType,
): bigint | number | string => {
  if (valueIsPseudoBigInt(type.value)) {
    return pseudoBigIntToBigInt(type.value);
  }
  return type.value;
};
