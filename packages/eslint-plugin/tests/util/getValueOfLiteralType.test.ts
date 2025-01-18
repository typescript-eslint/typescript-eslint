import type * as ts from 'typescript';

import { getValueOfLiteralType } from '../../src/util/getValueOfLiteralType';

describe(getValueOfLiteralType, () => {
  it('returns a string for a string literal type', () => {
    const stringLiteralType = {
      value: 'hello' satisfies string,
    } as ts.LiteralType;

    const result = getValueOfLiteralType(stringLiteralType);

    expect(result).toBe('hello');
    expect(result).toBeTypeOf('string');
  });

  it('returns a number for a numeric literal type', () => {
    const numberLiteralType = {
      value: 42 satisfies number,
    } as ts.LiteralType;

    const result = getValueOfLiteralType(numberLiteralType);

    expect(result).toBe(42);
    expect(result).toBeTypeOf('number');
  });

  it('returns a bigint for a pseudo-bigint literal type', () => {
    const pseudoBigIntLiteralType = {
      value: {
        base10Value: '12345678901234567890',
        negative: false,
      } satisfies ts.PseudoBigInt,
    } as ts.LiteralType;

    const result = getValueOfLiteralType(pseudoBigIntLiteralType);

    expect(result).toBe(BigInt('12345678901234567890'));
    expect(result).toBeTypeOf('bigint');
  });

  it('returns a negative bigint for a pseudo-bigint with negative=true', () => {
    const negativePseudoBigIntLiteralType = {
      value: {
        base10Value: '98765432109876543210',
        negative: true,
      } satisfies ts.PseudoBigInt,
    } as ts.LiteralType;

    const result = getValueOfLiteralType(negativePseudoBigIntLiteralType);

    expect(result).toBe(BigInt('-98765432109876543210'));
    expect(result).toBeTypeOf('bigint');
  });
});
