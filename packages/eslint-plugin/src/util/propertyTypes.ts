import * as ts from 'typescript';

import { nullThrows, NullThrowsReasons } from './nullThrows';

export function getTypeOfPropertyOfType(
  checker: ts.TypeChecker,
  type: ts.Type,
  propertyName: string,
): ts.Type {
  const reason = NullThrowsReasons.MissingToken(
    `property "${propertyName}"`,
    'type',
  );

  return propertyName.startsWith('__')
    ? checker.getDeclaredTypeOfSymbol(
        nullThrows(
          type
            .getProperties()
            .find(property => property.escapedName === propertyName),
          reason,
        ),
      )
    : nullThrows(checker.getTypeOfPropertyOfType(type, propertyName), reason);
}
