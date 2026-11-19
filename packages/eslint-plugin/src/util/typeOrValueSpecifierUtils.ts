import type { TypeOrValueSpecifier } from '@typescript-eslint/type-utils';
import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

import {
  getConstrainedTypeAtLocation,
  typeMatchesSomeSpecifier,
  valueMatchesSomeSpecifier,
} from '@typescript-eslint/type-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { matchesTypeOrBaseType } from './baseTypeUtils';
import { getStaticMemberAccessValue } from './misc';
import { skipChainExpression } from './skipChainExpression';

export function hasPropertySpecifiers(
  specifiers: TypeOrValueSpecifier[] | undefined,
): specifiers is TypeOrValueSpecifier[] {
  return Boolean(
    specifiers?.some(
      specifier =>
        typeof specifier !== 'string' && specifier.properties != null,
    ),
  );
}

function getMemberExpressionPropertyName(
  node: TSESTree.MemberExpression,
  context: RuleContext<string, unknown[]>,
  services: ParserServicesWithTypeInformation,
): string | undefined {
  const staticValue = getStaticMemberAccessValue(node, context);
  if (typeof staticValue === 'string') {
    return staticValue;
  }

  const keyType = services.getTypeAtLocation(node.property);
  return keyType.isStringLiteral() || keyType.isNumberLiteral()
    ? String(keyType.value)
    : undefined;
}

export function objectMatchesSomePropertySpecifier(
  objectNode: TSESTree.Node,
  propertyName: string,
  specifiers: TypeOrValueSpecifier[] | undefined,
  services: ParserServicesWithTypeInformation,
  providedObjectType?: ts.Type,
  checkBaseTypes = false,
): boolean {
  if (!hasPropertySpecifiers(specifiers)) {
    return false;
  }

  const unwrappedObject = skipChainExpression(objectNode);
  const rawType =
    providedObjectType ??
    getConstrainedTypeAtLocation(services, unwrappedObject);
  const objectType = services.program
    .getTypeChecker()
    .getNonNullableType(rawType);

  const typeMatches = checkBaseTypes
    ? matchesTypeOrBaseType(
        services,
        type =>
          typeMatchesSomeSpecifier(
            type,
            specifiers,
            services.program,
            propertyName,
          ),
        objectType,
      )
    : typeMatchesSomeSpecifier(
        objectType,
        specifiers,
        services.program,
        propertyName,
      );

  return (
    typeMatches ||
    valueMatchesSomeSpecifier(
      unwrappedObject,
      specifiers,
      services.program,
      objectType,
      propertyName,
    )
  );
}

export function memberExpressionMatchesSomeSpecifier(
  node: TSESTree.Node,
  specifiers: TypeOrValueSpecifier[] | undefined,
  context: RuleContext<string, unknown[]>,
  services: ParserServicesWithTypeInformation,
  options?: { checkBaseTypes?: boolean },
): boolean {
  if (!hasPropertySpecifiers(specifiers)) {
    return false;
  }

  const unwrapped = skipChainExpression(node);
  if (unwrapped.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const propertyName = getMemberExpressionPropertyName(
    unwrapped,
    context,
    services,
  );
  if (propertyName == null) {
    return false;
  }

  return objectMatchesSomePropertySpecifier(
    unwrapped.object,
    propertyName,
    specifiers,
    services,
    undefined,
    options?.checkBaseTypes,
  );
}
