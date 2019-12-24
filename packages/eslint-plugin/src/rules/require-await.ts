import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/require-await';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

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

    /**
     * Checks if the node returns a thenable type
     *
     * @param {ASTNode} node - The node to check
     * @returns {boolean}
     */
    function isThenableType(node: ts.Node): boolean {
      const type = checker.getTypeAtLocation(node);

      return tsutils.isThenableType(checker, node, type);
    }

    return {
      FunctionDeclaration: rules.FunctionDeclaration,
      FunctionExpression: rules.FunctionExpression,
      ArrowFunctionExpression: rules.ArrowFunctionExpression,
      'ArrowFunctionExpression[async = true]'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        // If body type is not BlockStatment, we need to check the return type here
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          const expression = parserServices.esTreeNodeToTSNodeMap.get(
            node.body,
          );
          if (expression && isThenableType(expression)) {
            // tell the base rule to mark the scope as having an await so it ignores it
            rules.AwaitExpression();
          }
        }
      },
      'FunctionDeclaration:exit': rules['FunctionDeclaration:exit'],
      'FunctionExpression:exit': rules['FunctionExpression:exit'],
      'ArrowFunctionExpression:exit': rules['ArrowFunctionExpression:exit'],
      AwaitExpression: rules.AwaitExpression,
      ForOfStatement: rules.ForOfStatement,

      ReturnStatement(node): void {
        const { expression } = parserServices.esTreeNodeToTSNodeMap.get<
          ts.ReturnStatement
        >(node);
        if (expression && isThenableType(expression)) {
          // tell the base rule to mark the scope as having an await so it ignores it
          rules.AwaitExpression();
        }
      },
    };
  },
});
