import type { Type, UnionOrIntersectionType } from 'typescript';
import { TypeFlags } from 'typescript';

export function isUnionOrIntersectionType(
  type: Type,
): type is UnionOrIntersectionType {
  return (type.flags & TypeFlags.UnionOrIntersection) !== 0;
}
