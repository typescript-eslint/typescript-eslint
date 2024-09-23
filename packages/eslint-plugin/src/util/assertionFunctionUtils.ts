import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { getConstrainedTypeAtLocation } from './index';

/**
 * Inspect a call expression to see if it's a call to an assertion function.
 * If it is, return the node of the argument that is asserted.
 */
export function findTruthinessAssertedArgument(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
): TSESTree.Expression | undefined {
  // If the call looks like `assert(expr1, expr2, ...c, d, e, f)`, then we can
  // only care if `expr1` or `expr2` is asserted, since anything that happens
  // within or after a spread argument is out of scope to reason about.
  const checkableArguments: TSESTree.Expression[] = [];
  for (const argument of node.arguments) {
    if (argument.type === AST_NODE_TYPES.SpreadElement) {
      break;
    }
    checkableArguments.push(argument);
  }

  // nothing to do
  if (checkableArguments.length === 0) {
    return undefined;
  }

  // Game plan: we're going to check the type of the callee. If it has call
  // signatures and they _ALL_ agree that they assert on a parameter at the
  // _SAME_ position, we'll consider the argument in that position to be an
  // asserted argument.
  const calleeType = getConstrainedTypeAtLocation(services, node.callee);
  const callSignatures = tsutils.getCallSignaturesOfType(calleeType);

  if (callSignatures.length === 0) {
    return undefined;
  }

  const checker = services.program.getTypeChecker();

  const typePredicates = callSignatures.map(signature =>
    checker.getTypePredicateOfSignature(signature),
  );

  const [firstTypePredicateResult, ...otherTypePredicateResults] =
    typePredicates;
  if (firstTypePredicateResult == null) {
    return undefined;
  }

  // Ensure all call signatures are asserting the same thing.
  const { parameterIndex, kind, type } = firstTypePredicateResult;
  if (!(kind === ts.TypePredicateKind.AssertsIdentifier && type == null)) {
    return undefined;
  }

  if (
    otherTypePredicateResults.some(
      otherResult =>
        otherResult == null ||
        otherResult.parameterIndex !== parameterIndex ||
        otherResult.kind !== kind ||
        otherResult.type != null,
    )
  ) {
    return undefined;
  }

  return checkableArguments.at(parameterIndex);
}

/**
 * Inspect a call expression to see if it's a call to an assertion function.
 * If it is, return the node of the argument that is asserted.
 */
export function findTypeGuardAssertedArgument(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
):
  | {
      asserts: boolean;
      argument: TSESTree.Expression;
      type: ts.Type;
    }
  | undefined {
  // If the call looks like `assert(expr1, expr2, ...c, d, e, f)`, then we can
  // only care if `expr1` or `expr2` is asserted, since anything that happens
  // within or after a spread argument is out of scope to reason about.
  const checkableArguments: TSESTree.Expression[] = [];
  for (const argument of node.arguments) {
    if (argument.type === AST_NODE_TYPES.SpreadElement) {
      break;
    }
    checkableArguments.push(argument);
  }

  // nothing to do
  if (checkableArguments.length === 0) {
    return undefined;
  }

  // Game plan: we're going to check the type of the callee. If it has call
  // signatures and they _ALL_ agree that they assert on a parameter at the
  // _SAME_ position, we'll consider the argument in that position to be an
  // asserted argument.
  const calleeType = getConstrainedTypeAtLocation(services, node.callee);
  const callSignatures = tsutils.getCallSignaturesOfType(calleeType);

  if (callSignatures.length === 0) {
    return undefined;
  }

  const checker = services.program.getTypeChecker();

  const typePredicates = callSignatures.map(signature =>
    checker.getTypePredicateOfSignature(signature),
  );

  const [firstTypePredicateResult, ...otherTypePredicateResults] =
    typePredicates;
  if (firstTypePredicateResult == null) {
    return undefined;
  }

  // Ensure all call signatures are asserting the same thing.
  const { parameterIndex, kind, type } = firstTypePredicateResult;
  if (
    !(
      (kind === ts.TypePredicateKind.AssertsIdentifier && type != null) ||
      (kind === ts.TypePredicateKind.Identifier && type != null)
    )
  ) {
    return undefined;
  }

  if (
    otherTypePredicateResults.some(
      otherResult =>
        otherResult == null ||
        otherResult.parameterIndex !== parameterIndex ||
        otherResult.kind !== kind ||
        otherResult.type !== type,
    )
  ) {
    return undefined;
  }

  if (parameterIndex >= checkableArguments.length) {
    return undefined;
  }

  return {
    type,
    asserts: kind === ts.TypePredicateKind.AssertsIdentifier,
    argument: checkableArguments[parameterIndex],
  };
}
