import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

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

  const checker = services.program.getTypeChecker();
  const tsNode = services.esTreeNodeToTSNodeMap.get(node);
  const signature = checker.getResolvedSignature(tsNode);

  if (signature == null) {
    return undefined;
  }

  const firstTypePredicateResult =
    checker.getTypePredicateOfSignature(signature);

  if (firstTypePredicateResult == null) {
    return undefined;
  }

  const { kind, parameterIndex, type } = firstTypePredicateResult;
  if (!(kind === ts.TypePredicateKind.AssertsIdentifier && type == null)) {
    return undefined;
  }

  return checkableArguments.at(parameterIndex);
}

/**
 * Inspect a call expression to see if it's a call to an assertion function.
 * If it is, return the node of the argument that is asserted and other useful info.
 */
export function findTypeGuardAssertedArgument(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
):
  | {
      argument: TSESTree.Expression;
      asserts: boolean;
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

  const checker = services.program.getTypeChecker();
  const tsNode = services.esTreeNodeToTSNodeMap.get(node);
  const callSignature = checker.getResolvedSignature(tsNode);

  if (callSignature == null) {
    return undefined;
  }

  const typePredicateInfo = checker.getTypePredicateOfSignature(callSignature);

  if (typePredicateInfo == null) {
    return undefined;
  }

  const { kind, parameterIndex, type } = typePredicateInfo;
  if (
    !(
      (kind === ts.TypePredicateKind.AssertsIdentifier ||
        kind === ts.TypePredicateKind.Identifier) &&
      type != null
    )
  ) {
    return undefined;
  }

  if (parameterIndex >= checkableArguments.length) {
    return undefined;
  }

  return {
    argument: checkableArguments[parameterIndex],
    asserts: kind === ts.TypePredicateKind.AssertsIdentifier,
    type,
  };
}
