import type { TSESTree } from '@typescript-eslint/utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
} from '../util';

export default createRule({
  name: 'no-unsafe-type-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertions that widen a type',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeTypeAssertion:
        "Unsafe type assertion: type '{{type}}' is more narrow than the original type.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkExpression(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void {
      const nodeType = getConstrainedTypeAtLocation(services, node.expression);
      const assertedType = getConstrainedTypeAtLocation(
        services,
        node.typeAnnotation,
      );

      const isAssertionSafe = checker.isTypeAssignableTo(
        nodeType,
        assertedType,
      );

      if (!isAssertionSafe) {
        context.report({
          node,
          messageId: 'unsafeTypeAssertion',
          data: {
            type: checker.typeToString(nodeType),
          },
        });
      }
    }

    return {
      'TSAsExpression, TSTypeAssertion'(
        node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      ): void {
        checkExpression(node);
      },
    };
  },
});
