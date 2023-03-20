import type * as ts from 'typescript';

export interface IntrinsicType extends ts.Type {
  intrinsicName: string;
}

export function isTypeIntrinsic(
  type: ts.Type,
  intrinsicName: string,
): type is IntrinsicType {
  return type.intrinsicName === intrinsicName;
}
