import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
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
        const services = util.getParserServices(context);
        const checker = services.program.getTypeChecker();

        const type = util.getConstrainedTypeAtLocation(services, node.right);

        if (
          util.isTypeArrayTypeOrUnionOfArrayTypes(type, checker) ||
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
