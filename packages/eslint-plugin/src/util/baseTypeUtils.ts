import type { ParserServicesWithTypeInformation } from '@typescript-eslint/utils';
import type { InterfaceType, Type } from 'typescript';

import { isObjectFlagSet, isObjectType } from 'ts-api-utils';
import { ObjectFlags } from 'typescript';

export function hasBaseTypes(type: Type): type is InterfaceType {
  return (
    isObjectType(type) &&
    isObjectFlagSet(type, ObjectFlags.Interface | ObjectFlags.Class)
  );
}

/**
 * Recursively checks if a type or any of its base types matches the provided
 * matcher function.
 * @param services Parser services with type information
 * @param matcher Function to test if a type matches the desired criteria
 * @param type The type to check
 * @param seen Set of already visited types to prevent infinite recursion
 * @returns `true` if the type or any of its base types match the matcher
 */
export function matchesTypeOrBaseType(
  services: ParserServicesWithTypeInformation,
  matcher: (type: Type) => boolean,
  type: Type,
  seen = new Set<Type>(),
): boolean {
  if (seen.has(type)) {
    return false;
  }

  seen.add(type);

  if (matcher(type)) {
    return true;
  }

  if (hasBaseTypes(type)) {
    const checker = services.program.getTypeChecker();
    return checker
      .getBaseTypes(type)
      .some(base => matchesTypeOrBaseType(services, matcher, base, seen));
  }

  return false;
}
