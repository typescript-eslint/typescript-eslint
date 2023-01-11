import { ESLintUtils } from '@typescript-eslint/utils';
import {
  isConditionalType,
  isIntersectionType,
  isObjectType,
  isPropertyReadonlyInType,
  isSymbolFlagSet,
  isUnionType,
  unionTypeParts,
} from 'tsutils';
import * as ts from 'typescript';

import { getTypeOfPropertyOfType } from './propertyTypes';
import type { TypeOrValueSpecifier } from './TypeOrValueSpecifier';
import {
  typeMatchesSpecifier,
  typeOrValueSpecifierSchema,
} from './TypeOrValueSpecifier';

const enum Readonlyness {
  /** the type cannot be handled by the function */
  UnknownType = 1,
  /** the type is mutable */
  Mutable = 2,
  /** the type is readonly */
  Readonly = 3,
}

export interface ReadonlynessOptions {
  readonly treatMethodsAsReadonly?: boolean;
  readonly allowlist?: Array<TypeOrValueSpecifier>;
}

export const readonlynessOptionsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    treatMethodsAsReadonly: {
      type: 'boolean',
    },
    allowlist: {
      type: 'array',
      items: typeOrValueSpecifierSchema,
    },
  },
};

export const readonlynessOptionsDefaults: ReadonlynessOptions = {
  treatMethodsAsReadonly: false,
  allowlist: [],
};

function hasSymbol(node: ts.Node): node is ts.Node & { symbol: ts.Symbol } {
  return Object.prototype.hasOwnProperty.call(node, 'symbol');
}

function isTypeReadonlyArrayOrTuple(
  program: ts.Program,
  type: ts.Type,
  options: ReadonlynessOptions,
  seenTypes: Set<ts.Type>,
): Readonlyness {
  const checker = program.getTypeChecker();
  function checkTypeArguments(arrayType: ts.TypeReference): Readonlyness {
    const typeArguments =
      // getTypeArguments was only added in TS3.7
      checker.getTypeArguments
        ? checker.getTypeArguments(arrayType)
        : arrayType.typeArguments ?? [];

    // this shouldn't happen in reality as:
    // - tuples require at least 1 type argument
    // - ReadonlyArray requires at least 1 type argument
    /* istanbul ignore if */ if (typeArguments.length === 0) {
      return Readonlyness.Readonly;
    }

    // validate the element types are also readonly
    if (
      typeArguments.some(
        typeArg =>
          isTypeReadonlyRecurser(program, typeArg, options, seenTypes) ===
          Readonlyness.Mutable,
      )
    ) {
      return Readonlyness.Mutable;
    }
    return Readonlyness.Readonly;
  }

  if (checker.isArrayType(type)) {
    const symbol = ESLintUtils.nullThrows(
      type.getSymbol(),
      ESLintUtils.NullThrowsReasons.MissingToken('symbol', 'array type'),
    );
    const escapedName = symbol.getEscapedName();
    if (escapedName === 'Array') {
      return Readonlyness.Mutable;
    }

    return checkTypeArguments(type);
  }

  if (checker.isTupleType(type)) {
    if (!type.target.readonly) {
      return Readonlyness.Mutable;
    }

    return checkTypeArguments(type);
  }

  return Readonlyness.UnknownType;
}

function isTypeReadonlyObject(
  program: ts.Program,
  type: ts.Type,
  options: ReadonlynessOptions,
  seenTypes: Set<ts.Type>,
): Readonlyness {
  const checker = program.getTypeChecker();
  function checkIndexSignature(kind: ts.IndexKind): Readonlyness {
    const indexInfo = checker.getIndexInfoOfType(type, kind);
    if (indexInfo) {
      if (!indexInfo.isReadonly) {
        return Readonlyness.Mutable;
      }

      if (indexInfo.type === type || seenTypes.has(indexInfo.type)) {
        return Readonlyness.Readonly;
      }

      return isTypeReadonlyRecurser(
        program,
        indexInfo.type,
        options,
        seenTypes,
      );
    }

    return Readonlyness.UnknownType;
  }

  const properties = type.getProperties();
  if (properties.length) {
    // ensure the properties are marked as readonly
    for (const property of properties) {
      if (options.treatMethodsAsReadonly) {
        if (
          property.valueDeclaration !== undefined &&
          hasSymbol(property.valueDeclaration) &&
          isSymbolFlagSet(
            property.valueDeclaration.symbol,
            ts.SymbolFlags.Method,
          )
        ) {
          continue;
        }

        const declarations = property.getDeclarations();
        const lastDeclaration =
          declarations !== undefined && declarations.length > 0
            ? declarations[declarations.length - 1]
            : undefined;
        if (
          lastDeclaration !== undefined &&
          hasSymbol(lastDeclaration) &&
          isSymbolFlagSet(lastDeclaration.symbol, ts.SymbolFlags.Method)
        ) {
          continue;
        }
      }

      if (isPropertyReadonlyInType(type, property.getEscapedName(), checker)) {
        continue;
      }

      const name = ts.getNameOfDeclaration(property.valueDeclaration);
      if (name && ts.isPrivateIdentifier(name)) {
        continue;
      }

      return Readonlyness.Mutable;
    }

    // all properties were readonly
    // now ensure that all of the values are readonly also.

    // do this after checking property readonly-ness as a perf optimization,
    // as we might be able to bail out early due to a mutable property before
    // doing this deep, potentially expensive check.
    for (const property of properties) {
      const propertyType = ESLintUtils.nullThrows(
        getTypeOfPropertyOfType(checker, type, property),
        ESLintUtils.NullThrowsReasons.MissingToken(
          `property "${property.name}"`,
          'type',
        ),
      );

      // handle recursive types.
      // we only need this simple check, because a mutable recursive type will break via the above prop readonly check
      if (seenTypes.has(propertyType)) {
        continue;
      }

      if (
        isTypeReadonlyRecurser(program, propertyType, options, seenTypes) ===
        Readonlyness.Mutable
      ) {
        return Readonlyness.Mutable;
      }
    }
  }

  const isStringIndexSigReadonly = checkIndexSignature(ts.IndexKind.String);
  if (isStringIndexSigReadonly === Readonlyness.Mutable) {
    return isStringIndexSigReadonly;
  }

  const isNumberIndexSigReadonly = checkIndexSignature(ts.IndexKind.Number);
  if (isNumberIndexSigReadonly === Readonlyness.Mutable) {
    return isNumberIndexSigReadonly;
  }

  return Readonlyness.Readonly;
}

// a helper function to ensure the seenTypes map is always passed down, except by the external caller
function isTypeReadonlyRecurser(
  program: ts.Program,
  type: ts.Type,
  options: ReadonlynessOptions,
  seenTypes: Set<ts.Type>,
): Readonlyness.Readonly | Readonlyness.Mutable {
  const checker = program.getTypeChecker();
  seenTypes.add(type);

  if (
    options.allowlist?.some(specifier =>
      typeMatchesSpecifier(type, specifier, program),
    )
  ) {
    return Readonlyness.Readonly;
  }

  if (isUnionType(type)) {
    // all types in the union must be readonly
    const result = unionTypeParts(type).every(
      t =>
        seenTypes.has(t) ||
        isTypeReadonlyRecurser(program, t, options, seenTypes) ===
          Readonlyness.Readonly,
    );
    const readonlyness = result ? Readonlyness.Readonly : Readonlyness.Mutable;
    return readonlyness;
  }

  if (isIntersectionType(type)) {
    // Special case for handling arrays/tuples (as readonly arrays/tuples always have mutable methods).
    if (
      type.types.some(t => checker.isArrayType(t) || checker.isTupleType(t))
    ) {
      const allReadonlyParts = type.types.every(
        t =>
          seenTypes.has(t) ||
          isTypeReadonlyRecurser(program, t, options, seenTypes) ===
            Readonlyness.Readonly,
      );
      return allReadonlyParts ? Readonlyness.Readonly : Readonlyness.Mutable;
    }

    // Normal case.
    const isReadonlyObject = isTypeReadonlyObject(
      program,
      type,
      options,
      seenTypes,
    );
    if (isReadonlyObject !== Readonlyness.UnknownType) {
      return isReadonlyObject;
    }
  }

  if (isConditionalType(type)) {
    const result = [type.root.node.trueType, type.root.node.falseType]
      .map(checker.getTypeFromTypeNode)
      .every(
        t =>
          seenTypes.has(t) ||
          isTypeReadonlyRecurser(program, t, options, seenTypes) ===
            Readonlyness.Readonly,
      );

    const readonlyness = result ? Readonlyness.Readonly : Readonlyness.Mutable;
    return readonlyness;
  }

  // all non-object, non-intersection types are readonly.
  // this should only be primitive types
  if (!isObjectType(type)) {
    return Readonlyness.Readonly;
  }

  // pure function types are readonly
  if (
    type.getCallSignatures().length > 0 &&
    type.getProperties().length === 0
  ) {
    return Readonlyness.Readonly;
  }

  const isReadonlyArray = isTypeReadonlyArrayOrTuple(
    program,
    type,
    options,
    seenTypes,
  );
  if (isReadonlyArray !== Readonlyness.UnknownType) {
    return isReadonlyArray;
  }

  const isReadonlyObject = isTypeReadonlyObject(
    program,
    type,
    options,
    seenTypes,
  );
  /* istanbul ignore else */ if (
    isReadonlyObject !== Readonlyness.UnknownType
  ) {
    return isReadonlyObject;
  }

  throw new Error('Unhandled type');
}

/**
 * Checks if the given type is readonly
 */
function isTypeReadonly(
  program: ts.Program,
  type: ts.Type,
  options: ReadonlynessOptions = readonlynessOptionsDefaults,
): boolean {
  return (
    isTypeReadonlyRecurser(program, type, options, new Set()) ===
    Readonlyness.Readonly
  );
}

export { isTypeReadonly };
