import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule<[], 'arrayDeleteViolation'>({
  name: 'no-array-delete',
  meta: {
    docs: {
      description: 'Disallow delete operator for arrays',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      arrayDeleteViolation:
        'Using delete operator for arrays are forbidden. Use array.splice instead.',
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      "UnaryExpression[operator='delete']"(
        node: TSESTree.UnaryExpression,
      ): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const expression = originalNode.getChildAt(1);

        const target = expression.getChildAt(0),
          key = expression.getChildAt(2);

        const targetType = util.getConstrainedTypeAtLocation(checker, target),
          keyType = util.getConstrainedTypeAtLocation(checker, key);

        if (
          util.isTypeAnyArrayType(targetType, checker) &&
          (keyType.flags & ts.TypeFlags.Number) !== 0
        ) {
          context.report({
            node,
            messageId: 'arrayDeleteViolation',
            fix(fixer) {
              return fixer.replaceText(
                node,
                `${target.getText()}.splice(${key.getText()}, 1)`,
              );
            },
          });
        }
      },
    };
  },
});
