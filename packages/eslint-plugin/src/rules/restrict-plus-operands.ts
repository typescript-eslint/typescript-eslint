import { TSESTree } from '@typescript-eslint/typescript-estree';
import ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'restrict-plus-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'When adding two variables, operands must both be of type number or of type string.',
      tslintRuleName: 'restrict-plus-operands',
      category: 'Best Practices',
      recommended: false,
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
     * @param type type to be evaluated
     * @returns string, number or invalid
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

      if (stringType === 'number' || stringType === 'string') {
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
      "BinaryExpression[operator='+']"(node: TSESTree.BinaryExpression) {
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
