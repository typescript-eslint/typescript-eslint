import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeArrayTypeOrUnionOfArrayTypes,
} from '../util';

export default createRule({
  name: 'no-for-in-array',
  meta: {
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      forInViolation:
        'For-in loops over arrays are forbidden. Use for-of or array.forEach instead.',
    },
    schema: [],
    type: 'problem',
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
            node,
            messageId: 'forInViolation',
          });
        }
      },
    };
  },
});
