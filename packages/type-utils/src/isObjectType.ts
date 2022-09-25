import type { ObjectType, Type } from 'typescript';
import { TypeFlags } from 'typescript';

export function isObjectType(type: Type): type is ObjectType {
  return (type.flags & TypeFlags.Object) !== 0;
}
