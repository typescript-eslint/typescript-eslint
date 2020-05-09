import * as ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'no-for-in-array',
  meta: {
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      category: 'Best Practices',
      recommended: 'error',
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
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const type = util.getConstrainedTypeAtLocation(
          checker,
          originalNode.expression,
        );

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
