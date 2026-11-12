import type { TypeOrValueSpecifier } from '../TypeOrValueSpecifier';

export function specifierPropertyMatches(
  specifier: TypeOrValueSpecifier,
  propertyName: string | undefined,
): boolean {
  if (typeof specifier === 'string' || specifier.properties == null) {
    return propertyName == null;
  }

  if (propertyName == null) {
    return false;
  }

  return typeof specifier.properties === 'string'
    ? specifier.properties === propertyName
    : specifier.properties.includes(propertyName);
}
