import * as ts from 'typescript';

export function getTypeOfPropertyOfName(
  checker: ts.TypeChecker,
  type: ts.Type,
  name: string,
  escapedName?: ts.__String,
): ts.Type | undefined {
  // Most names are directly usable in the checker and aren't different from escaped names
  if (!escapedName || !name.startsWith('__')) {
    return checker.getTypeOfPropertyOfType(type, name);
  }

  // Symbolic names may differ in their escaped name compared to their human-readable name
  // https://github.com/typescript-eslint/typescript-eslint/issues/2143
  const escapedProperty = type
    .getProperties()
    .find(property => property.escapedName === escapedName);

  return escapedProperty
    ? checker.getDeclaredTypeOfSymbol(escapedProperty)
    : undefined;
}

export function getTypeOfPropertyOfType(
  checker: ts.TypeChecker,
  type: ts.Type,
  property: ts.Symbol,
): ts.Type | undefined {
  return getTypeOfPropertyOfName(
    checker,
    type,
    property.getName(),
    property.getEscapedName(),
  );
}
