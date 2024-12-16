import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 *
 * If the type is generic and does _not_ have a constraint, the type will be
 * returned as-is, rather than returning an `unknown` type. This can be checked
 * for by checking for the type flag ts.TypeFlags.TypeParameter.
 *
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/10438
 *
 * @deprecated Use {@link getConstraintTypeInfoAtLocation} instead.
 */
export function getConstrainedTypeAtLocation(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): ts.Type {
  const nodeType = services.getTypeAtLocation(node);
  const constrained = services.program
    .getTypeChecker()
    .getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}

export interface ConstraintTypeInfoUnconstrained {
  constraintType: undefined;
  isTypeParameter: true;
  type: ts.TypeParameter;
}

export interface ConstraintTypeInfoConstrained {
  constraintType: ts.Type;
  isTypeParameter: true;
  type: ts.TypeParameter;
}

export interface ConstraintTypeInfoNonGeneric {
  constraintType: ts.Type;
  isTypeParameter: false;
  type: ts.Type;
}

export type ConstraintTypeInfo =
  | ConstraintTypeInfoConstrained
  | ConstraintTypeInfoNonGeneric
  | ConstraintTypeInfoUnconstrained;

/**
 * Resolves the given node's type, and returns info about whether it is a generic or ordinary type.
 *
 * Successor to {@link getConstrainedTypeAtLocation} due to https://github.com/typescript-eslint/typescript-eslint/issues/10438
 */
export function getConstraintTypeInfoAtLocation(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): ConstraintTypeInfo {
  const type = services.getTypeAtLocation(node);
  if (tsutils.isTypeParameter(type)) {
    const checker = services.program.getTypeChecker();
    const constraintType = checker.getBaseConstraintOfType(type);
    return {
      constraintType,
      isTypeParameter: true,
      type,
    };
  }
  return {
    constraintType: type,
    isTypeParameter: false,
    type,
  };
}
