/**
 * @fileoverview Requires any function or method that returns a Promise to be marked async
 * @author Josh Goldberg <https://github.com/joshuakgoldberg>
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [
  {
    allowedPromiseNames?: string[];
    checkArrowFunctions?: boolean;
    checkFunctionDeclarations?: boolean;
    checkFunctionExpressions?: boolean;
    checkMethodDeclarations?: boolean;
  }
];
type MessageIds = 'missingAsync';

export default util.createRule<Options, MessageIds>({
  name: 'promise-function-async',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires any function or method that returns a Promise to be marked async.',
      tslintName: 'promise-function-async',
      category: 'Best Practices',
      recommended: 'error'
    },
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
  defaultOptions: [
    {
      allowedPromiseNames: [],
      checkArrowFunctions: true,
      checkFunctionDeclarations: true,
      checkFunctionExpressions: true,
      checkMethodDeclarations: true
    }
  ],
  create(
    context,
    [
      {
        allowedPromiseNames,
        checkArrowFunctions,
        checkFunctionDeclarations,
        checkFunctionExpressions,
        checkMethodDeclarations
      }
    ]
  ) {
    const allAllowedPromiseNames = new Set([
      'Promise',
      ...allowedPromiseNames!
    ]);
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function validateNode(node: TSESTree.Node) {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const [callSignature] = checker
        .getTypeAtLocation(originalNode)
        .getCallSignatures();
      const returnType = checker.getReturnTypeOfSignature(callSignature);

      if (!util.containsTypeByName(returnType, allAllowedPromiseNames)) {
        return;
      }

      context.report({
        messageId: 'missingAsync',
        node
      });
    }

    return {
      'ArrowFunctionExpression[async = false]'(
        node: TSESTree.ArrowFunctionExpression
      ) {
        if (checkArrowFunctions) {
          validateNode(node);
        }
      },
      'FunctionDeclaration[async = false]'(node: TSESTree.FunctionDeclaration) {
        if (checkFunctionDeclarations) {
          validateNode(node);
        }
      },
      'FunctionExpression[async = false]'(node: TSESTree.FunctionExpression) {
        if (
          node.parent &&
          'kind' in node.parent &&
          node.parent.kind === 'method'
        ) {
          if (checkMethodDeclarations) {
            validateNode(node.parent);
          }
        } else if (checkFunctionExpressions) {
          validateNode(node);
        }
      }
    };
  }
});
