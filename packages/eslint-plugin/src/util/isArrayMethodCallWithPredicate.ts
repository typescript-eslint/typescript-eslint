import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

import { getConstrainedTypeAtLocation } from '@typescript-eslint/type-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import { getStaticMemberAccessValue } from './misc';

const ARRAY_PREDICATE_FUNCTIONS = new Set<unknown>([
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'some',
  'every',
]);

export function isArrayMethodCallWithPredicate(
  context: RuleContext<string, unknown[]>,
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
): boolean {
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const staticAccessValue = getStaticMemberAccessValue(node.callee, context);

  if (!ARRAY_PREDICATE_FUNCTIONS.has(staticAccessValue)) {
    return false;
  }

  const checker = services.program.getTypeChecker();
  const type = getConstrainedTypeAtLocation(services, node.callee.object);
  return tsutils
    .unionTypeParts(type)
    .flatMap(part => tsutils.intersectionTypeParts(part))
    .some(t => checker.isArrayType(t) || checker.isTupleType(t));
}
