import type { Type, TypeFlags } from 'typescript';

import { unionTypeParts } from './unionTypeParts';

/**
 * Gets all of the type flags in a type, iterating through unions automatically
 */
export function getTypeFlags(type: Type): TypeFlags {
  let flags: TypeFlags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}
