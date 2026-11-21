import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeAnyType,
} from '../util';

const CHECKED_BINARY_AND_ASSIGNMENT_OPERATORS = new Set([
  '-',
  '*',
  '/',
  '%',
  '**',
  '&',
  '|',
  '^',
  '<<',
  '>>',
  '>>>',
  '<',
  '<=',
  '>',
  '>=',
  '-=',
  '*=',
  '/=',
  '%=',
  '**=',
  '&=',
  '|=',
  '^=',
  '<<=',
  '>>=',
  '>>>=',
]);

export default createRule({
  name: 'no-unsafe-operand',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow arithmetic, bitwise, and relational operations on a value with type `any`',
      requiresTypeChecking: true,
    },
    messages: {
      errorOperand:
        'Unsafe operand of the `{{operator}}` operator. Its type could not be resolved.',
      unsafeOperand:
        'Unsafe `any` typed operand of the `{{operator}}` operator.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);

    const checkOperand = (node: TSESTree.Node, operator: string) => {
      const type = getConstrainedTypeAtLocation(services, node);

      if (isTypeAnyType(type)) {
        context.report({
          node,
          messageId: tsutils.isIntrinsicErrorType(type)
            ? 'errorOperand'
            : 'unsafeOperand',
          data: { operator },
        });
      }
    };

    return {
      'AssignmentExpression, BinaryExpression'(
        node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
      ) {
        if (CHECKED_BINARY_AND_ASSIGNMENT_OPERATORS.has(node.operator)) {
          checkOperand(node.left, node.operator);
          checkOperand(node.right, node.operator);
        }
      },
      UnaryExpression(node) {
        // Unary `+` is an explicit conversion to a number, so it is allowed
        if (node.operator === '-' || node.operator === '~') {
          checkOperand(node.argument, node.operator);
        }
      },
      UpdateExpression(node) {
        checkOperand(node.argument, node.operator);
      },
    };
  },
});
