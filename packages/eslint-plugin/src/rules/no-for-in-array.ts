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

        if (
          isTypeArrayTypeOrUnionOfArrayTypes(type, checker) ||
          (type.flags & ts.TypeFlags.StringLike) !== 0
        ) {
          context.report({
            loc: getForStatementHeadLoc(context.sourceCode, node),
            messageId: 'forInViolation',
          });
        }
      },
    };
  },
});

function isTypeArrayTypeOrUnionOfArrayTypes(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  for (const t of tsutils.unionTypeParts(type)) {
    if (tsutils.isTypeFlagSet(t, ts.TypeFlags.Undefined | ts.TypeFlags.Null)) {
      continue;
    }

    if (!checker.isArrayType(t)) {
      return false;
    }
  }

  return true;
}
