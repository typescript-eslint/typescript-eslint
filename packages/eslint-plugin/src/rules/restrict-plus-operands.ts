import { TSESTree } from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'restrict-plus-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'When adding two variables, operands must both be of type number or of type string',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      notNumbers:
        "Operands of '+' operation must either be both strings or both numbers.",
      notStrings:
        "Operands of '+' operation must either be both strings or both numbers. Consider using a template literal.",
      notBigInts: "Operands of '+' operation must be both bigints.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const service = util.getParserServices(context);

    const typeChecker = service.program.getTypeChecker();

    type BaseLiteral = 'string' | 'number' | 'bigint' | 'invalid';

    /**
     * Helper function to get base type of node
     */
    function getBaseTypeOfLiteralType(type: ts.Type): BaseLiteral {
      const constraint = type.getConstraint();
      if (
        constraint &&
        // for generic types with union constraints, it will return itself from getConstraint
        // so we have to guard against infinite recursion...
        constraint !== type
      ) {
        return getBaseTypeOfLiteralType(constraint);
      }

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
    function getNodeType(node: TSESTree.Node): BaseLiteral {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = typeChecker.getTypeAtLocation(tsNode);

      return getBaseTypeOfLiteralType(type);
    }

    return {
      "BinaryExpression[operator='+']"(node: TSESTree.BinaryExpression): void {
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
      },
    };
  },
});
