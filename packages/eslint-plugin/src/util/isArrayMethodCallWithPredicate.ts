import { getConstrainedTypeAtLocation } from '@typescript-eslint/type-utils';
import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

const ARRAY_PREDICATE_FUNCTIONS = new Set([
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'some',
  'every',
]);

export function isArrayMethodCallWithPredicate(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
): boolean {
  if (
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    node.callee.property.type === AST_NODE_TYPES.Identifier &&
    ARRAY_PREDICATE_FUNCTIONS.has(node.callee.property.name)
  ) {
    const checker = services.program.getTypeChecker();
    const type = getConstrainedTypeAtLocation(services, node.callee.object);
    return tsutils
      .typeParts(type)
      .some(t => checker.isArrayType(t) || checker.isTupleType(t));
  }
  return false;
}
