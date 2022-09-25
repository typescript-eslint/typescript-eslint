import type { __String, MappedTypeNode, Type, TypeChecker } from 'typescript';
import { IndexKind, ObjectFlags, SymbolFlags, SyntaxKind } from 'typescript';

import { getPropertyOfType } from './getPropertyOfType';
import { isIntersectionType } from './isIntersectionType';
import { isNumericPropertyName } from './isNumericPropertyName';
import { isObjectFlagSet } from './isObjectFlagSet';
import { isObjectType } from './isObjectType';
import { isSymbolFlagSet } from './isSymbolFlagSet';
import { isTupleTypeReference } from './isTupleTypeReference';
import { someTypePart } from './someTypePart';
import { symbolHasReadonlyDeclaration } from './symbolHasReadOnlyDeclaration';
import { unionTypeParts } from './unionTypeParts';

export function isPropertyReadonlyInType(
  type: Type,
  name: __String,
  checker: TypeChecker,
): boolean {
  let seenProperty = false;
  let seenReadonlySignature = false;

  for (const t of unionTypeParts(type)) {
    if (getPropertyOfType(t, name) === undefined) {
      // property is not present in this part of the union -> check for readonly index signature
      const index =
        (isNumericPropertyName(name)
          ? checker.getIndexInfoOfType(t, IndexKind.Number)
          : undefined) ?? checker.getIndexInfoOfType(t, IndexKind.String);

      if (index?.isReadonly) {
        if (seenProperty) {
          return true;
        }

        seenReadonlySignature = true;
      }
    } else if (
      seenReadonlySignature ||
      isReadonlyPropertyIntersection(t, name, checker)
    ) {
      return true;
    } else {
      seenProperty = true;
    }
  }

  return false;
}

function isReadonlyPropertyIntersection(
  type: Type,
  name: __String,
  checker: TypeChecker,
): boolean {
  return someTypePart(type, isIntersectionType, t => {
    const prop = getPropertyOfType(t, name);

    if (prop === undefined) {
      return false;
    }

    if (prop.flags & SymbolFlags.Transient) {
      if (/^(?:[1-9]\d*|0)$/.test(<string>name) && isTupleTypeReference(t)) {
        return t.target.readonly;
      }

      switch (isReadonlyPropertyFromMappedType(t, name, checker)) {
        case true:
          return true;
        case false:
          return false;
        default:
        // `undefined` falls through
      }
    }

    return (
      // members of namespace import
      isSymbolFlagSet(prop, SymbolFlags.ValueModule) ||
      // we unwrapped every mapped type, now we can check the actual declarations
      symbolHasReadonlyDeclaration(prop, checker)
    );
  });
}

function isReadonlyPropertyFromMappedType(
  type: Type,
  name: __String,
  checker: TypeChecker,
): boolean | undefined {
  if (!isObjectType(type) || !isObjectFlagSet(type, ObjectFlags.Mapped)) {
    return;
  }

  const declaration = <MappedTypeNode>type.symbol.getDeclarations()![0];
  // well-known symbols are not affected by mapped types
  if (
    declaration.readonlyToken !== undefined &&
    !/^__@[^@]+$/.test(<string>name)
  ) {
    return declaration.readonlyToken.kind !== SyntaxKind.MinusToken;
  }

  return isPropertyReadonlyInType(
    (<{ modifiersType: Type }>(<unknown>type)).modifiersType,
    name,
    checker,
  );
}
