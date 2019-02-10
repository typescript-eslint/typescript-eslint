/**
 * @fileoverview Requires any function or method that returns a Promise to be marked async
 * @author Josh Goldberg <https://github.com/joshuakgoldberg>
 */
'use strict';

const util = require('../util');
const types = require('../utils/types');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    allowedPromiseNames: [],
    checkArrowFunctions: true,
    checkFunctionDeclarations: true,
    checkFunctionExpressions: true,
    checkMethodDeclarations: true
  }
];

/**
 * @type {import("eslint").Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires any function or method that returns a Promise to be marked async.',
      extraDescription: [util.tslintRule('promise-function-async')],
      category: 'TypeScript',
      url: util.metaDocsUrl('promise-function-async'),
      recommended: 'error'
    },
    fixable: null,
    messages: {
      missingAsync: 'Functions that return promises must be async.'
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
          },
          checkArrowFunctions: {
            type: 'boolean'
          },
          checkFunctionDeclarations: {
            type: 'boolean'
          },
          checkFunctionExpressions: {
            type: 'boolean'
          },
          checkMethodDeclarations: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const {
      allowedPromiseNames,
      checkArrowFunctions,
      checkFunctionDeclarations,
      checkFunctionExpressions,
      checkMethodDeclarations
    } = util.applyDefault(defaultOptions, context.options)[0];

    const allAllowedPromiseNames = new Set(['Promise', ...allowedPromiseNames]);
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    /**
     * @param {import("estree").Function} node
     */
    function validateNode(node) {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const [callSignature] = checker
        .getTypeAtLocation(originalNode)
        .getCallSignatures();
      const returnType = checker.getReturnTypeOfSignature(callSignature);

      if (!types.containsTypeByName(returnType, allAllowedPromiseNames)) {
        return;
      }

      context.report({
        messageId: 'missingAsync',
        node
      });
    }

    return {
      ArrowFunctionExpression(node) {
        if (checkArrowFunctions && !node.async) {
          validateNode(node);
        }
      },
      FunctionDeclaration(node) {
        if (checkFunctionDeclarations && !node.async) {
          validateNode(node);
        }
      },
      FunctionExpression(node) {
        if (!!node.parent && node.parent.kind === 'method') {
          if (checkMethodDeclarations && !node.async) {
            validateNode(node.parent);
          }
        } else if (checkFunctionExpressions && !node.async) {
          validateNode(node);
        }
      }
    };
  }
};
