import type {
  __String,
  ComputedPropertyName,
  NamedDeclaration,
  Symbol as SymbolType,
  Type,
  TypeChecker,
} from 'typescript';

import { isUniqueESSymbolType } from './isUniqueESSymbolType';

export function getWellKnownSymbolPropertyOfType(
  type: Type,
  wellKnownSymbolName: string,
  checker: TypeChecker,
): SymbolType | undefined {
  const prefix = '__@' + wellKnownSymbolName;
  for (const prop of type.getProperties()) {
    if (!prop.name.startsWith(prefix)) {
      continue;
    }

    const globalSymbol = checker
      .getApparentType(
        checker.getTypeAtLocation(
          (<ComputedPropertyName>(<NamedDeclaration>prop.valueDeclaration).name)
            .expression,
        ),
      )
      .getSymbol();

    if (
      prop.escapedName ===
      getPropertyNameOfWellKnownSymbol(
        checker,
        globalSymbol,
        wellKnownSymbolName,
      )
    ) {
      return prop;
    }
  }

  return;
}

function getPropertyNameOfWellKnownSymbol(
  checker: TypeChecker,
  symbolConstructor: SymbolType | undefined,
  symbolName: string,
): __String {
  const knownSymbol =
    symbolConstructor &&
    checker
      .getTypeOfSymbolAtLocation(
        symbolConstructor,
        // TODO: Investigate type error
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        symbolConstructor.valueDeclaration,
      )
      .getProperty(symbolName);
  const knownSymbolType =
    knownSymbol &&
    checker.getTypeOfSymbolAtLocation(
      knownSymbol,
      // TODO: Investigate type error
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      knownSymbol.valueDeclaration,
    );

  if (knownSymbolType && isUniqueESSymbolType(knownSymbolType)) {
    return knownSymbolType.escapedName;
  }

  return <__String>('__@' + symbolName);
}
