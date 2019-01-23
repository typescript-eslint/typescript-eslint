/**
 * @fileoverview When adding two variables, operands must both be of type number or of type string.
 * @author James Henry
 * @author Armano <https://github.com/armano2>
 */
'use strict';

const util = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'When adding two variables, operands must both be of type number or of type string.',
      extraDescription: [util.tslintRule('restrict-plus-operands')],
      category: 'TypeScript',
      url: util.metaDocsUrl('restrict-plus-operands')
    },
    messages: {
      notNumbers:
        "Operands of '+' operation must either be both strings or both numbers.",
      notStrings:
        "Operands of '+' operation must either be both strings or both numbers. Consider using a template literal."
    },
    schema: []
  },

  create(context) {
    const service = util.getParserServices(context);

    const typeChecker = service.program.getTypeChecker();

    /**
     * Helper function to get base type of node
     * @param {ts.Type} type type to be evaluated
     * @returns {*} string, number or invalid
     */
    function getBaseTypeOfLiteralType(type) {
      if (type.isNumberLiteral()) {
        return 'number';
      }
      if (type.isStringLiteral()) {
        return 'string';
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
     * @param {ASTNode} node the node to be evaluated.
     * @returns {*} string, number or invalid
     */
    function getNodeType(node) {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = typeChecker.getTypeAtLocation(tsNode);

      return getBaseTypeOfLiteralType(type);
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      "BinaryExpression[operator='+']"(node) {
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
              messageId: 'notStrings'
            });
          } else {
            context.report({
              node,
              messageId: 'notNumbers'
            });
          }
        }
      }
    };
  }
};
