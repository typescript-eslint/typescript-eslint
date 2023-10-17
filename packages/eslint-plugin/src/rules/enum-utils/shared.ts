import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { isTypeFlagSet } from '../../util';

/*
 * If passed an enum member, returns the type of the parent. Otherwise,
 * returns itself.
 *
 * For example:
 * - `Fruit` --> `Fruit`
 * - `Fruit.Apple` --> `Fruit`
 */
function getBaseEnumType(typeChecker: ts.TypeChecker, type: ts.Type): ts.Type {
  const symbol = type.getSymbol()!;
  if (!tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember)) {
    return type;
  }

  return typeChecker.getTypeAtLocation(symbol.valueDeclaration!.parent);
}

/**
 * Retrieve only the Enum literals from a type. for example:
 * - 123 --> []
 * - {} --> []
 * - Fruit.Apple --> [Fruit.Apple]
 * - Fruit.Apple | Vegetable.Lettuce --> [Fruit.Apple, Vegetable.Lettuce]
 * - Fruit.Apple | Vegetable.Lettuce | 123 --> [Fruit.Apple, Vegetable.Lettuce]
 * - T extends Fruit --> [Fruit]
 */
export function getEnumLiterals(type: ts.Type): ts.LiteralType[] {
  return tsutils
    .unionTypeParts(type)
    .filter((subType): subType is ts.LiteralType =>
      isTypeFlagSet(subType, ts.TypeFlags.EnumLiteral),
    );
}

/**
 * A type can have 0 or more enum types. For example:
 * - 123 --> []
 * - {} --> []
 * - Fruit.Apple --> [Fruit]
 * - Fruit.Apple | Vegetable.Lettuce --> [Fruit, Vegetable]
 * - Fruit.Apple | Vegetable.Lettuce | 123 --> [Fruit, Vegetable]
 * - T extends Fruit --> [Fruit]
 */
export function getEnumTypes(
  typeChecker: ts.TypeChecker,
  type: ts.Type,
): ts.Type[] {
  return getEnumLiterals(type).map(type => getBaseEnumType(typeChecker, type));
}

/**
 * Returns the enum key that matches the given literal node, or null if none
 * match. For example:
 * ```ts
 * enum Fruit {
 *   Apple = 'apple',
 *   Banana = 'banana',
 * }
 *
 * getEnumKeyForLiteral([Fruit.Apple, Fruit.Banana], 'apple') --> 'Fruit.Apple'
 * getEnumKeyForLiteral([Fruit.Apple, Fruit.Banana], 'banana') --> 'Fruit.Banana'
 * getEnumKeyForLiteral([Fruit.Apple, Fruit.Banana], 'cherry') --> null
 * ```
 */
export function getEnumKeyForLiteral(
  enumLiterals: ts.LiteralType[],
  literal: unknown,
): string | null {
  for (const enumLiteral of enumLiterals) {
    if (enumLiteral.value === literal) {
      const memberSymbol = enumLiteral.symbol;
      const enumDeclaration = (memberSymbol.valueDeclaration as ts.EnumMember)
        .parent;

      const enumName = enumDeclaration.name.getText();
      const memberName = memberSymbol.name;

      return `${enumName}.${memberName}`;
    }
  }

  return null;
}
