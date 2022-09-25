import type { IntersectionType, Type } from 'typescript';
import { TypeFlags } from 'typescript';

export function isIntersectionType(type: Type): type is IntersectionType {
  return (type.flags & TypeFlags.Intersection) !== 0;
}
