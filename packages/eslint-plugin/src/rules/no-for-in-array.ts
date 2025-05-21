import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
} from '../util';
import { getForStatementHeadLoc } from '../util/getForStatementHeadLoc';

export default createRule({
  name: 'no-for-in-array',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      forInViolation:
        'For-in loops over arrays skips holes, returns indices as strings, and may visit the prototype chain or other enumerable properties. Use a more robust iteration method such as for-of or array.forEach instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ForInStatement(node): void {
        const services = getParserServices(context);
        const checker = services.program.getTypeChecker();

        const type = getConstrainedTypeAtLocation(services, node.right);

        if (isArrayLike(checker, type)) {
          context.report({
            loc: getForStatementHeadLoc(context.sourceCode, node),
            messageId: 'forInViolation',
          });
        }
      },
    };
  },
});

function isArrayLike(checker: ts.TypeChecker, type: ts.Type): boolean {
  return isTypeRecurser(
    type,
    t => t.getNumberIndexType() != null && hasArrayishLength(checker, t),
  );
}

function hasArrayishLength(checker: ts.TypeChecker, type: ts.Type): boolean {
  const lengthProperty = type.getProperty('length');

  if (lengthProperty == null) {
    return false;
  }

  return tsutils.isTypeFlagSet(
    checker.getTypeOfSymbol(lengthProperty),
    ts.TypeFlags.NumberLike,
  );
}

function isTypeRecurser(
  type: ts.Type,
  predicate: (t: ts.Type) => boolean,
): boolean {
  if (type.isUnionOrIntersection()) {
    return type.types.some(t => isTypeRecurser(t, predicate));
  }

  return predicate(type);
}
