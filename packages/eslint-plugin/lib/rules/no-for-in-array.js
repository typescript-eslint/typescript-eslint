/**
 * @fileoverview Disallow iterating over an array with a for-in loop
 * @author Benjamin Lichtman
 */
'use strict';
const ts = require('typescript');
const util = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @type {import("eslint").Rule.RuleModule}
 */
module.exports = {
  meta: {
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      category: 'Functionality',
      recommended: false,
      extraDescription: [util.tslintRule('no-for-in-array')],
      url: util.metaDocsUrl('no-for-in-array')
    },
    fixable: null,
    messages: {
      forInViolation:
        'For-in loops over arrays are forbidden. Use for-of or array.forEach instead.'
    },
    schema: [],
    type: 'problem'
  },

  create(context) {
    return {
      ForInStatement(node) {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const type = checker.getTypeAtLocation(originalNode.expression);

        if (
          (typeof type.symbol !== 'undefined' &&
            type.symbol.name === 'Array') ||
          (type.flags & ts.TypeFlags.StringLike) !== 0
        ) {
          context.report({
            node,
            messageId: 'forInViolation'
          });
        }
      }
    };
  }
};
