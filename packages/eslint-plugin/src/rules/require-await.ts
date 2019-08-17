import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/require-await';
import * as tsutils from 'tsutils';
import ts from 'typescript';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

interface ScopeInfo {
  upper: ScopeInfo | null;
  returnsPromise: boolean;
}

export default util.createRule<Options, MessageIds>({
  name: 'require-await',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow async functions which have no `await` expression',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    let scopeInfo: ScopeInfo | null = null;

    /**
     * Push the scope info object to the stack.
     *
     * @returns {void}
     */
    function enterFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression,
    ): void {
      scopeInfo = {
        upper: scopeInfo,
        returnsPromise: false,
      };

      switch (node.type) {
        case AST_NODE_TYPES.FunctionDeclaration:
          rules.FunctionDeclaration(node);
          break;

        case AST_NODE_TYPES.FunctionExpression:
          rules.FunctionExpression(node);
          break;

        case AST_NODE_TYPES.ArrowFunctionExpression:
          rules.ArrowFunctionExpression(node);
          break;
      }
    }

    /**
     * Pop the top scope info object from the stack.
     * Passes through to the base rule if the function doesn't return a promise
     *
     * @param {ASTNode} node - The node exiting
     * @returns {void}
     */
    function exitFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression,
    ): void {
      if (scopeInfo) {
        if (!scopeInfo.returnsPromise) {
          switch (node.type) {
            case AST_NODE_TYPES.FunctionDeclaration:
              rules['FunctionDeclaration:exit'](node);
              break;

            case AST_NODE_TYPES.FunctionExpression:
              rules['FunctionExpression:exit'](node);
              break;

            case AST_NODE_TYPES.ArrowFunctionExpression:
              rules['ArrowFunctionExpression:exit'](node);
              break;
          }
        }

        scopeInfo = scopeInfo.upper;
      }
    }

    return {
      'FunctionDeclaration[async = true]': enterFunction,
      'FunctionExpression[async = true]': enterFunction,
      'ArrowFunctionExpression[async = true]': enterFunction,
      'FunctionDeclaration[async = true]:exit': exitFunction,
      'FunctionExpression[async = true]:exit': exitFunction,
      'ArrowFunctionExpression[async = true]:exit': exitFunction,

      ReturnStatement(node): void {
        if (!scopeInfo) {
          return;
        }

        const { expression } = parserServices.esTreeNodeToTSNodeMap.get<
          ts.ReturnStatement
        >(node);
        if (!expression) {
          return;
        }

        const type = checker.getTypeAtLocation(expression);
        if (tsutils.isThenableType(checker, expression, type)) {
          scopeInfo.returnsPromise = true;
        }
      },

      AwaitExpression: rules.AwaitExpression as TSESLint.RuleFunction<
        TSESTree.Node
      >,
      ForOfStatement: rules.ForOfStatement as TSESLint.RuleFunction<
        TSESTree.Node
      >,
    };
  },
});
