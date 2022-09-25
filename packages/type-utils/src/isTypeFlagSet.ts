import type { Type } from 'typescript';
import { TypeFlags } from 'typescript';

import { getTypeFlags } from './getTypeFlags';

/**
 * Checks if the given type is (or accepts) the given flags
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isTypeFlagSet(
  type: Type,
  flagsToCheck: TypeFlags,
  isReceiver?: boolean,
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (TypeFlags.Any | TypeFlags.Unknown)) {
    return true;
  }

  return (flags & flagsToCheck) !== 0;
}
