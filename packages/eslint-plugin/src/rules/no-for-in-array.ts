import * as ts from 'typescript';

import {
  createRule,
  getConstraintInfo,
  getParserServices,
  isTypeArrayTypeOrUnionOfArrayTypes,
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

        const { constraintType } = getConstraintInfo(
          checker,
          services.getTypeAtLocation(node.right),
        );

        if (
          constraintType != null &&
          (isTypeArrayTypeOrUnionOfArrayTypes(constraintType, checker) ||
            (constraintType.flags & ts.TypeFlags.StringLike) !== 0)
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
