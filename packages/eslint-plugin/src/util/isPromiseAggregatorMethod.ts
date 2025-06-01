import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

import {
  getConstrainedTypeAtLocation,
  isPromiseConstructorLike,
} from '@typescript-eslint/type-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { getStaticMemberAccessValue } from './misc';

const PROMISE_CONSTRUCTOR_ARRAY_METHODS = new Set<unknown>([
  'all',
  'allSettled',
  'race',
]);

export function isPromiseAggregatorMethod(
  context: RuleContext<string, unknown[]>,
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
): boolean {
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const staticAccessValue = getStaticMemberAccessValue(node.callee, context);

  if (!PROMISE_CONSTRUCTOR_ARRAY_METHODS.has(staticAccessValue)) {
    return false;
  }

  return isPromiseConstructorLike(
    services.program,
    getConstrainedTypeAtLocation(services, node.callee.object),
  );
}
