/**
 * @fileoverview Disallows awaiting a value that is not a Promise
 * @author Josh Goldberg
 */
'use strict';
const util = require('../util');
const types = require('../utils/types');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    allowedPromiseNames: []
  }
];

/**
 * @type {import("eslint").Rule.RuleModule}
 */
module.exports = {
  meta: {
    docs: {
      description: 'Disallows awaiting a value that is not a Promise',
      category: 'Functionality',
      recommended: 'error',
      extraDescription: [util.tslintRule('await-promise')],
      url: util.metaDocsUrl('await-promise')
    },
    fixable: null,
    messages: {
      await: 'Invalid `await` of a non-Promise value.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPromiseNames: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        additionalProperties: false
      }
    ],
    type: 'problem'
  },

  create(context) {
    const options = util.applyDefault(defaultOptions, context.options)[0];

    const allowedPromiseNames = new Set([
      'Promise',
      ...options.allowedPromiseNames
    ]);

    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      AwaitExpression(node) {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(originalNode.expression);

        if (!types.containsTypeByName(type, allowedPromiseNames)) {
          context.report({
            messageId,
            node
          });
        }
      }
    };
  }
};
