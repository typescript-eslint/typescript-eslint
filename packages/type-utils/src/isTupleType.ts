import type { ObjectType, TupleType, Type } from 'typescript';
import { ObjectFlags, TypeFlags } from 'typescript';

export function isTupleType(type: Type): type is TupleType {
  return (
    (type.flags & TypeFlags.Object &&
      (<ObjectType>type).objectFlags & ObjectFlags.Tuple) !== 0
  );
}
