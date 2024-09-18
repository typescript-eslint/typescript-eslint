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

  let assertedParameterIndex: number | undefined = undefined;
  for (const signature of callSignatures) {
    const declaration = signature.getDeclaration();
    const returnTypeAnnotation = declaration.type;

    // Be sure we're dealing with a truthiness assertion function.
    if (
      !(
        returnTypeAnnotation != null &&
        ts.isTypePredicateNode(returnTypeAnnotation) &&
        // This eliminates things like `x is string` and `asserts x is T`
        // leaving us with just the `asserts x` cases.
        returnTypeAnnotation.type == null &&
        // I think this is redundant but, still, it needs to be true
        returnTypeAnnotation.assertsModifier != null
      )
    ) {
      return undefined;
    }

    const assertionTarget = returnTypeAnnotation.parameterName;
    if (assertionTarget.kind !== ts.SyntaxKind.Identifier) {
      // This can happen when asserting on `this`. Ignore!
      return undefined;
    }

    // If the first parameter is `this`, skip it, so that our index matches
    // the index of the argument at the call site.
    const firstParameter = declaration.parameters.at(0);
    const nonThisParameters =
      firstParameter?.name.kind === ts.SyntaxKind.Identifier &&
      firstParameter.name.text === 'this'
        ? declaration.parameters.slice(1)
        : declaration.parameters;

    // Don't bother inspecting parameters past the number of
    // arguments we have at the call site.
    const checkableNonThisParameters = nonThisParameters.slice(
      0,
      checkableArguments.length,
    );

    let assertedParameterIndexForThisSignature: number | undefined;
    for (const [index, parameter] of checkableNonThisParameters.entries()) {
      if (parameter.dotDotDotToken != null) {
        // Cannot assert a rest parameter, and can't have a rest parameter
        // before the asserted parameter. It's not only a TS error, it's
        // not something we can logically make sense of, so give up here.
        return undefined;
      }

      if (parameter.name.kind !== ts.SyntaxKind.Identifier) {
        // Only identifiers are valid for assertion targets, so skip over
        // anything like `{ destructuring: parameter }: T`
        continue;
      }

      // we've found a match between the "target"s in
      // `function asserts(target: T): asserts target;`
      if (parameter.name.text === assertionTarget.text) {
        assertedParameterIndexForThisSignature = index;
        break;
      }
    }

    if (assertedParameterIndexForThisSignature == null) {
      // Didn't find an assertion target in this signature that could match
      // the call site.
      return undefined;
    }

    if (
      assertedParameterIndex != null &&
      assertedParameterIndex !== assertedParameterIndexForThisSignature
    ) {
      // The asserted parameter we found for this signature didn't match
      // previous signatures.
      return undefined;
    }

    assertedParameterIndex = assertedParameterIndexForThisSignature;
  }

  // Didn't find a unique assertion index.
  if (assertedParameterIndex == null) {
    return undefined;
  }

  return checkableArguments[assertedParameterIndex];
}
