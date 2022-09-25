import type { Type } from 'typescript';

import { isUnionType } from './isUnionType';

export function unionTypeParts(type: Type): Type[] {
  return isUnionType(type) ? type.types : [type];
}
