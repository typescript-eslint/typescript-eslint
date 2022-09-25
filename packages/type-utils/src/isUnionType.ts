import type { Type, UnionType } from 'typescript';
import { TypeFlags } from 'typescript';

export function isUnionType(type: Type): type is UnionType {
  return (type.flags & TypeFlags.Union) !== 0;
}
