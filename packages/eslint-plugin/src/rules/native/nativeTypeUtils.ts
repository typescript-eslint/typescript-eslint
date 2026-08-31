import type { NativeParserServices, TSESTree } from '@typescript-eslint/utils';
import type {
  Checker,
  Program,
  Project,
  Symbol as NativeSymbol,
  Type as NativeType,
  TypeFlags,
} from '@typescript/native/unstable/sync';

import {
  isComputedPropertyName,
  isGetAccessorDeclaration,
  isMethodDeclaration,
  isMethodSignatureDeclaration,
  isPropertyDeclaration,
  isPropertySignatureDeclaration,
  isSetAccessorDeclaration,
} from '@typescript/native/unstable/ast/is';
import { TypeFlags as NativeTypeFlags } from '@typescript/native/unstable/sync';

export const isTypeFlagSet = (type: NativeType, flags: TypeFlags): boolean =>
  (type.flags & flags) !== 0;

export const unionConstituents = (type: NativeType): readonly NativeType[] =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The native API declares this as optional.
  type.isUnionType() ? (type.getTypes() ?? [type]) : [type];

export const getConstrainedTypeAtLocation = (
  services: NativeParserServices,
  node: TSESTree.Node,
): NativeType => {
  const type = services.getTypeAtLocation(node);
  return services.native.checker.getBaseConstraintOfType(type) ?? type;
};

export const isTypeAnyType = (type: NativeType): boolean =>
  isTypeFlagSet(type, NativeTypeFlags.Any);

export const isTypeUnknownType = (type: NativeType): boolean =>
  isTypeFlagSet(type, NativeTypeFlags.Unknown);

export const isTypeParameter = (type: NativeType): boolean =>
  isTypeFlagSet(type, NativeTypeFlags.TypeParameter);

const isSymbolFromDefaultLibrary = (
  program: Program,
  project: Project,
  symbol: NativeSymbol,
): boolean =>
  // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- The native symbol API exposes declaration handles as a property.
  symbol.declarations.some(declarationHandle => {
    const declaration = declarationHandle.resolve(project);
    return (
      declaration != null &&
      program.isSourceFileDefaultLibrary(declaration.getSourceFile())
    );
  });

export const isPromiseConstructorLike = (
  program: Program,
  project: Project,
  checker: Checker,
  type: NativeType,
): boolean => {
  if (type.isIntersectionType()) {
    return type
      .getTypes()
      .some(typePart =>
        isPromiseConstructorLike(program, project, checker, typePart),
      );
  }
  if (type.isUnionType()) {
    return type
      .getTypes()
      .every(typePart =>
        isPromiseConstructorLike(program, project, checker, typePart),
      );
  }
  if (isTypeParameter(type)) {
    const constraint = checker.getBaseConstraintOfType(type);
    return (
      constraint != null &&
      isPromiseConstructorLike(program, project, checker, constraint)
    );
  }

  const symbol = type.getSymbol();
  if (
    symbol?.name === 'PromiseConstructor' &&
    isSymbolFromDefaultLibrary(program, project, symbol)
  ) {
    return true;
  }

  return (
    type
      .getBaseTypes()
      ?.some(baseType =>
        isPromiseConstructorLike(program, project, checker, baseType),
      ) ?? false
  );
};

export const getWellKnownPropertyOfType = (
  program: Program,
  project: Project,
  checker: Checker,
  type: NativeType,
  name: '__@asyncDispose' | '__@asyncIterator' | '__@iterator',
): NativeSymbol | undefined => {
  const exactProperty = checker.getPropertyOfType(type, name);
  const fallbackProperties = checker
    .getPropertiesOfType(type)
    .filter(
      property =>
        property !== exactProperty &&
        property.escapedName.startsWith(`${name}@`),
    );
  const candidates = exactProperty
    ? [exactProperty, ...fallbackProperties]
    : fallbackProperties;

  return candidates.find(property =>
    // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- The native symbol API exposes declaration handles as a property.
    property.declarations.some(declarationHandle => {
      const declaration = declarationHandle.resolve(project);
      if (
        declaration == null ||
        !(
          isGetAccessorDeclaration(declaration) ||
          isMethodDeclaration(declaration) ||
          isMethodSignatureDeclaration(declaration) ||
          isPropertyDeclaration(declaration) ||
          isPropertySignatureDeclaration(declaration) ||
          isSetAccessorDeclaration(declaration)
        ) ||
        !isComputedPropertyName(declaration.name)
      ) {
        return false;
      }

      const referencedSymbol = checker.getSymbolAtLocation(
        declaration.name.expression,
      );
      return (
        referencedSymbol != null &&
        isSymbolFromDefaultLibrary(program, project, referencedSymbol)
      );
    }),
  );
};
