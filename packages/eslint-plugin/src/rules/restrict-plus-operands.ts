import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = [
  {
    checkCompoundAssignments?: boolean;
  },
];
type MessageIds = 'notNumbers' | 'notStrings' | 'notBigInts';

export default util.createRule<Options, MessageIds>({
  name: 'restrict-plus-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'When adding two variables, operands must both be of type number or of type string',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      notNumbers:
        "Operands of '+' operation must either be both strings or both numbers.",
      notStrings:
        "Operands of '+' operation must either be both strings or both numbers. Consider using a template literal.",
      notBigInts: "Operands of '+' operation must be both bigints.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkCompoundAssignments: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      checkCompoundAssignments: false,
    },
  ],
  create(context, [{ checkCompoundAssignments }]) {
    const service = util.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    type BaseLiteral = 'string' | 'number' | 'bigint' | 'invalid';

    /**
     * Helper function to get base type of node
     */
    function getBaseTypeOfLiteralType(type: ts.Type): BaseLiteral {
      if (type.isNumberLiteral()) {
        return 'number';
      }
      if (type.isStringLiteral()) {
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

      const stringType = typeChecker.typeToString(type);

      if (
        stringType === 'number' ||
        stringType === 'string' ||
        stringType === 'bigint'
      ) {
        return stringType;
      }
      return 'invalid';
    }

    /**
     * Helper function to get base type of node
     * @param node the node to be evaluated.
     */
    function getNodeType(node: TSESTree.Expression): BaseLiteral {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = util.getConstrainedTypeAtLocation(typeChecker, tsNode);

      return getBaseTypeOfLiteralType(type);
    }

    function checkPlusOperands(
      node: TSESTree.BinaryExpression | TSESTree.AssignmentExpression,
    ): void {
      const leftType = getNodeType(node.left);
      const rightType = getNodeType(node.right);

      if (
        leftType === 'invalid' ||
        rightType === 'invalid' ||
        leftType !== rightType
      ) {
        if (leftType === 'string' || rightType === 'string') {
          context.report({
            node,
            messageId: 'notStrings',
          });
        } else if (leftType === 'bigint' || rightType === 'bigint') {
          context.report({
            node,
            messageId: 'notBigInts',
          });
        } else {
          context.report({
            node,
            messageId: 'notNumbers',
          });
        }
      }
    }

    return {
      "BinaryExpression[operator='+']": checkPlusOperands,
      "AssignmentExpression[operator='+=']"(node): void {
        if (checkCompoundAssignments) {
          checkPlusOperands(node);
        }
      },
    };
  },
});
