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
export function findAssertedArgument(
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

  const checker = services.program.getTypeChecker();

  let assertedParameterIndex: number | undefined = undefined;
  for (const signature of callSignatures) {
    const predicateInfo = checker.getTypePredicateOfSignature(signature);
    if (predicateInfo == null) {
      return undefined;
    }

    // Be sure we're dealing with a truthiness assertion function, in other words,
    // `asserts x` (but not `asserts x is T`, and also not `asserts this is T`).
    if (
      !(
        predicateInfo.kind === ts.TypePredicateKind.AssertsIdentifier &&
        predicateInfo.type == null
      )
    ) {
      return undefined;
    }

    const assertedParameterIndexForThisSignature = predicateInfo.parameterIndex;

    if (
      assertedParameterIndex != null &&
      assertedParameterIndex !== assertedParameterIndexForThisSignature
    ) {
      // The asserted parameter we found for this signature didn't match
      // previous signatures.
      return undefined;
    }

    assertedParameterIndex = assertedParameterIndexForThisSignature;

    if (assertedParameterIndex >= checkableArguments.length) {
      return undefined;
    }
  }

  // Didn't find a unique assertion index.
  if (assertedParameterIndex == null) {
    return undefined;
  }

  return checkableArguments[assertedParameterIndex];
}
