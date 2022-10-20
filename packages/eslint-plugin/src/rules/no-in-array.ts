import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule<[], 'inArrayViolation'>({
  name: 'no-in-array',
  meta: {
    docs: {
      description: 'Disallow using in operator for arrays',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      inArrayViolation:
        "'in' operator for arrays is forbidden. Use array.indexOf or array.includes instead.",
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    return {
      "BinaryExpression[operator='in']"(node: TSESTree.BinaryExpression): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const type = util.getConstrainedTypeAtLocation(
          checker,
          originalNode.right,
        );

        if (
          util.isTypeArrayTypeOrUnionOfArrayTypes(type, checker) ||
          (type.flags & ts.TypeFlags.StringLike) !== 0
        ) {
          context.report({
            node,
            messageId: 'inArrayViolation',
          });
        }
      },
    };
  },
});
