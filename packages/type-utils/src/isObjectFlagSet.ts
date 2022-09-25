import type { ObjectFlags, ObjectType } from 'typescript';

export function isObjectFlagSet(
  objectType: ObjectType,
  flag: ObjectFlags,
): boolean {
  return (objectType.objectFlags & flag) !== 0;
}
