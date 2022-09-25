import type { ObjectType, Type, TypeReference } from 'typescript';
import { ObjectFlags, TypeFlags } from 'typescript';

export function isTypeReference(type: Type): type is TypeReference {
  return (
    (type.flags & TypeFlags.Object) !== 0 &&
    ((<ObjectType>type).objectFlags & ObjectFlags.Reference) !== 0
  );
}
