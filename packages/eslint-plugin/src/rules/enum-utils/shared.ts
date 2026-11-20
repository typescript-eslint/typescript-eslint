import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { isNumberLike, isStringLike, isTypeFlagSet } from '../../util';

/*
 * If passed an enum member, returns the type of the parent. Otherwise,
 * returns itself.
 *
 * For example:
 * - `Fruit` --> `Fruit`
 * - `Fruit.Apple` --> `Fruit`
 */
function getBaseEnumType(typeChecker: ts.TypeChecker, type: ts.Type): ts.Type {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const symbol = type.getSymbol()!;
  if (!tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember)) {
    return type;
  }

  return typeChecker.getTypeAtLocation(
    (symbol.valueDeclaration as ts.EnumMember).parent,
  );
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
    .unionConstituents(type)
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
 * @returns Whether two types compare unsafely because an enum value is being
 * compared against a non-enum value of the same primitive kind.
 */
export function isMismatchedEnumComparisonTypes(
  typeChecker: ts.TypeChecker,
  leftType: ts.Type,
  rightType: ts.Type,
): boolean {
  // Allow comparisons that don't have anything to do with enums:
  //
  // ```ts
  // 1 === 2;
  // ```
  const leftEnumTypes = getEnumTypes(typeChecker, leftType);
  const rightEnumTypes = new Set(getEnumTypes(typeChecker, rightType));
  if (leftEnumTypes.length === 0 && rightEnumTypes.size === 0) {
    return false;
  }

  // Allow comparisons that share an enum type:
  //
  // ```ts
  // Fruit.Apple === Fruit.Banana;
  // ```
  for (const leftEnumType of leftEnumTypes) {
    if (rightEnumTypes.has(leftEnumType)) {
      return false;
    }
  }

  // We need to split the type into the union type parts in order to find
  // valid enum comparisons like:
  //
  // ```ts
  // declare const something: Fruit | Vegetable;
  // something === Fruit.Apple;
  // ```
  const leftTypeParts = tsutils.unionConstituents(leftType);
  const rightTypeParts = tsutils.unionConstituents(rightType);

  // If a type exists in both sides, we consider this comparison safe:
  //
  // ```ts
  // declare const fruit: Fruit.Apple | 0;
  // fruit === 0;
  // ```
  for (const leftTypePart of leftTypeParts) {
    if (rightTypeParts.includes(leftTypePart)) {
      return false;
    }
  }

  return (
    typeViolates(leftTypeParts, rightType) ||
    typeViolates(rightTypeParts, leftType)
  );
}

/**
 * @returns Whether the right type is an unsafe comparison against any left type.
 */
function typeViolates(leftTypeParts: ts.Type[], rightType: ts.Type): boolean {
  const leftEnumValueTypes = new Set(leftTypeParts.map(getEnumValueType));

  return (
    (leftEnumValueTypes.has(ts.TypeFlags.Number) && isNumberLike(rightType)) ||
    (leftEnumValueTypes.has(ts.TypeFlags.String) && isStringLike(rightType))
  );
}

/**
 * @returns What type a type's enum value is (number or string), if either.
 */
export function getEnumValueType(type: ts.Type): ts.TypeFlags | undefined {
  return tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
    ? tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral)
      ? ts.TypeFlags.Number
      : ts.TypeFlags.String
    : undefined;
}

/**
 * @returns Whether `name` at `location` refers to the given enum, so that it
 * isn't out of scope or shadowed there.
 */
function enumNameResolvesAtLocation(
  typeChecker: ts.TypeChecker,
  enumDeclaration: ts.EnumDeclaration,
  location: ts.Node,
): boolean {
  const enumSymbol = typeChecker.getSymbolAtLocation(enumDeclaration.name);
  const symbolInScope = typeChecker
    .getSymbolsInScope(location, ts.SymbolFlags.Value | ts.SymbolFlags.Alias)
    .find(symbol => symbol.name === enumDeclaration.name.text);
  if (enumSymbol == null || symbolInScope == null) {
    return false;
  }

  let resolvedSymbol = typeChecker.getExportSymbolOfSymbol(symbolInScope);
  if (tsutils.isSymbolFlagSet(resolvedSymbol, ts.SymbolFlags.Alias)) {
    resolvedSymbol = typeChecker.getAliasedSymbol(resolvedSymbol);
  }

  return resolvedSymbol === enumSymbol;
}

/**
 * Returns the enum key that matches the given literal node, or null if none
 * match or the enum's name can't be referenced at `location`. For example:
 * ```ts
 * enum Fruit {
 *   Apple = 'apple',
 *   Banana = 'banana',
 * }
 *
 * getEnumKeyForLiteral(checker, [Fruit.Apple, Fruit.Banana], 'apple', location) --> 'Fruit.Apple'
 * getEnumKeyForLiteral(checker, [Fruit.Apple, Fruit.Banana], 'banana', location) --> 'Fruit.Banana'
 * getEnumKeyForLiteral(checker, [Fruit.Apple, Fruit.Banana], 'cherry', location) --> null
 * ```
 */
export function getEnumKeyForLiteral(
  typeChecker: ts.TypeChecker,
  enumLiterals: ts.LiteralType[],
  literal: unknown,
  location: ts.Node,
): string | null {
  for (const enumLiteral of enumLiterals) {
    if (enumLiteral.value !== literal) {
      continue;
    }

    const { symbol } = enumLiteral;

    const memberDeclaration = symbol.valueDeclaration as ts.EnumMember;
    const enumDeclaration = memberDeclaration.parent;

    if (!enumNameResolvesAtLocation(typeChecker, enumDeclaration, location)) {
      continue;
    }

    const memberNameIdentifier = memberDeclaration.name;
    const enumName = enumDeclaration.name.text;

    switch (memberNameIdentifier.kind) {
      case ts.SyntaxKind.Identifier:
        return `${enumName}.${memberNameIdentifier.text}`;

      case ts.SyntaxKind.StringLiteral: {
        const memberName = memberNameIdentifier.text
          .replaceAll('\\', '\\\\')
          .replaceAll("'", "\\'")
          .replaceAll('\n', '\\n')
          .replaceAll('\r', '\\r');

        return `${enumName}['${memberName}']`;
      }

      case ts.SyntaxKind.ComputedPropertyName:
        return `${enumName}[${memberNameIdentifier.expression.getText()}]`;

      default:
        break;
    }
  }

  return null;
}
