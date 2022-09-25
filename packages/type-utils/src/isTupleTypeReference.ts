import type { TupleType, Type, TypeReference } from 'typescript';

import { isTupleType } from './isTupleType';
import { isTypeReference } from './isTypeReference';

export function isTupleTypeReference(
  type: Type,
): type is TypeReference & { target: TupleType } {
  return isTypeReference(type) && isTupleType(type.target);
}
