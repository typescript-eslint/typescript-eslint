import type * as ts from 'typescript';

export function expandUnionOrIntersectionType(type: ts.Type): ts.Type[] {
  if (type.isUnionOrIntersection()) {
    return type.types.flatMap(expandUnionOrIntersectionType);
  }
  return [type];
}
