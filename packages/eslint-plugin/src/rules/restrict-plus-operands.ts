import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    allowAny?: boolean;
    skipCompoundAssignments?: boolean;
  },
];
type MessageIds =
  | 'notNumbers'
  | 'notStrings'
  | 'notBigInts'
  | 'notValidAnys'
  | 'notValidTypes';

export default util.createRule<Options, MessageIds>({
  name: 'restrict-plus-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require both operands of addition to be the same type and be `bigint`, `number`, or `string`',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      notNumbers:
        "Operands of '+' operation must either be both strings or both numbers.",
      notStrings:
        "Operands of '+' operation must either be both strings or both numbers. Consider using a template literal.",
      notBigInts: "Operands of '+' operation must be both bigints.",
      notValidAnys:
        "Operands of '+' operation with any is possible only with string, number, bigint or any",
      notValidTypes:
        "Operands of '+' operation must either be one of string, number, bigint or any (if allowed by option)",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAny: {
            description: 'Whether to allow `any` typed values.',
            type: 'boolean',
          },
          skipCompoundAssignments: {
            description:
              'Whether to skip checking compound assignments such as `+=`.',
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowAny: false,
      skipCompoundAssignments: false,
    },
  ],
  create(context, [{ allowAny, skipCompoundAssignments }]) {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();

    type BaseLiteral = 'string' | 'number' | 'bigint' | 'invalid' | 'any';

    /**
     * Helper function to get base type of node
     */
    function getBaseTypeOfLiteralType(type: ts.Type): BaseLiteral {
      if (type.isNumberLiteral()) {
        return 'number';
      }
      if (
        type.isStringLiteral() ||
        util.isTypeFlagSet(type, ts.TypeFlags.TemplateLiteral)
      ) {
        return 'string';
      }
      // is BigIntLiteral
      if (type.flags & ts.TypeFlags.BigIntLiteral) {
        return 'bigint';
      }
      if (type.isUnion()) {
        const types = type.types.map(getBaseTypeOfLiteralType);

        return types.every(value => value === types[0]) ? types[0] : 'invalid';
      }

      if (type.isIntersection()) {
        const types = type.types.map(getBaseTypeOfLiteralType);

        if (types.some(value => value === 'string')) {
          return 'string';
        }

        if (types.some(value => value === 'number')) {
          return 'number';
        }

        if (types.some(value => value === 'bigint')) {
          return 'bigint';
        }

        return 'invalid';
      }

      const stringType = checker.typeToString(type);

      if (
        stringType === 'number' ||
        stringType === 'string' ||
        stringType === 'bigint' ||
        stringType === 'any'
      ) {
        return stringType;
      }
      return 'invalid';
    }

    /**
     * Helper function to get base type of node
     * @param node the node to be evaluated.
     */
    function getNodeType(
      node: TSESTree.Expression | TSESTree.PrivateIdentifier,
    ): BaseLiteral {
      const type = util.getConstrainedTypeAtLocation(services, node);

      return getBaseTypeOfLiteralType(type);
    }

    function checkPlusOperands(
      node: TSESTree.BinaryExpression | TSESTree.AssignmentExpression,
    ): void {
      const leftType = getNodeType(node.left);
      const rightType = getNodeType(node.right);

      if (leftType === rightType) {
        if (leftType === 'invalid') {
          context.report({
            node,
            messageId: 'notValidTypes',
          });
        }

        if (!allowAny && leftType === 'any') {
          context.report({
            node,
            messageId: 'notValidAnys',
          });
        }

        return;
      }

      if (leftType === 'any' || rightType === 'any') {
        if (!allowAny || leftType === 'invalid' || rightType === 'invalid') {
          context.report({
            node,
            messageId: 'notValidAnys',
          });
        }

        return;
      }

      if (leftType === 'string' || rightType === 'string') {
        return context.report({
          node,
          messageId: 'notStrings',
        });
      }

      if (leftType === 'bigint' || rightType === 'bigint') {
        return context.report({
          node,
          messageId: 'notBigInts',
        });
      }

      if (leftType === 'number' || rightType === 'number') {
        return context.report({
          node,
          messageId: 'notNumbers',
        });
      }
    }

    return {
      "BinaryExpression[operator='+']": checkPlusOperands,
      ...(!skipCompoundAssignments && {
        "AssignmentExpression[operator='+=']"(node): void {
          checkPlusOperands(node);
        },
      }),
    };
  },
});
