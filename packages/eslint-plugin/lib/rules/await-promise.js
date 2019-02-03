/**
 * @fileoverview Disallows awaiting a value that is not a Promise
 * @author Josh Goldberg
 */
'use strict';
const tsutils = require('tsutils');
const ts = require('typescript');
const util = require('../util');

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

      if (!containsType(type, allowedSymbolNames)) {
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

/**
 * @param {string} type Type being awaited upon.
 * @param {Set<string>} allowedNames Symbol names being checked for.
 */
function containsType(type, allowedNames) {
  if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (tsutils.isTypeReference(type)) {
    type = type.target;
  }

  if (
    typeof type.symbol !== 'undefined' &&
    allowedNames.has(type.symbol.name)
  ) {
    return true;
  }

  if (tsutils.isUnionOrIntersectionType(type)) {
    return type.types.some(t => containsType(t, allowedNames));
  }

  const bases = type.getBaseTypes();
  return (
    typeof bases !== 'undefined' &&
    bases.some(t => containsType(t, allowedNames))
  );
}
