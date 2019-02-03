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
      await: 'Invalid `await` of a non-Promise value.',
      forOf: 'Invalid `for-await-of` of a non-AsyncIterable value.'
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

    const allowedAsyncIterableNames = new Set([
      'AsyncIterable',
      'AsyncIterableIterator'
    ]);

    const allowedPromiseNames = new Set([
      'Promise',
      ...options.allowedPromiseNames
    ]);

    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function validateNode(node, allowedSymbolNames, messageId) {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(originalNode.expression);

      if (!types.containsTypeByName(type, allowedSymbolNames)) {
        context.report({
          messageId,
          node
        });
      }
    }

    return {
      AwaitExpression(node) {
        validateNode(node, allowedPromiseNames, 'await');
      },
      ForOfStatement(node) {
        if (node.await) {
          validateNode(node, allowedAsyncIterableNames, 'forOf');
        }
      }
    };
  }
};
