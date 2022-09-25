import type { Type, UnionOrIntersectionType } from 'typescript';

export function someTypePart(
  type: Type,
  predicate: (t: Type) => t is UnionOrIntersectionType,
  cb: (t: Type) => boolean,
): boolean {
  return predicate(type) ? type.types.some(cb) : cb(type);
}
