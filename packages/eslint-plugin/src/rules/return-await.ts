import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import ts, { SyntaxKind } from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'return-await',
  meta: {
    docs: {
      description: 'Rules for awaiting returned promises',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    type: 'problem',
    messages: {
      nonPromiseAwait:
        'returning an awaited value that is not a promise is not allowed',
      disallowedPromiseAwait:
        'returning an awaited promise is not allowed in this context',
      requiredPromiseAwait:
        'returning an awaited promise is required in this context',
    },
    schema: [
      {
        enum: ['in-try-catch', 'always', 'never'],
      },
    ],
  },
  defaultOptions: ['in-try-catch'],

  create(context, [option]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function inTryCatch(node: ts.Node): boolean {
      let ancestor = node.parent;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (
          tsutils.isTryStatement(ancestor) ||
          tsutils.isCatchClause(ancestor)
        ) {
          return true;
        }

        ancestor = ancestor.parent;
      }

      return false;
    }

    function test(
      node: TSESTree.ReturnStatement | TSESTree.ArrowFunctionExpression,
      expression: ts.Node,
    ): void {
      let child: ts.Node;

      const isAwait = expression.kind === SyntaxKind.AwaitExpression;

      if (isAwait) {
        child = expression.getChildAt(1);
      } else {
        child = expression;
      }

      const type = checker.getTypeAtLocation(child);

      const isThenable =
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Any) ||
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Unknown) ||
        tsutils.isThenableType(checker, expression, type);

      if (!isAwait && !isThenable) {
        return;
      }

      if (isAwait && !isThenable) {
        context.report({
          messageId: 'nonPromiseAwait',
          node,
        });
        return;
      }

      if (option === 'always') {
        if (!isAwait && isThenable) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
          });
        }

        return;
      }

      if (option === 'never') {
        if (isAwait) {
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
          });
        }

        return;
      }

      if (option === 'in-try-catch') {
        const isInTryCatch = inTryCatch(expression);
        if (isAwait && !isInTryCatch) {
          context.report({
            messageId: 'disallowedPromiseAwait',
            node,
          });
        } else if (!isAwait && isInTryCatch) {
          context.report({
            messageId: 'requiredPromiseAwait',
            node,
          });
        }

        return;
      }
    }

    return {
      'ArrowFunctionExpression[async = true]:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          const expression = parserServices.esTreeNodeToTSNodeMap.get(
            node.body,
          );

          test(node, expression);
        }
      },
      ReturnStatement(node): void {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get<
          ts.ReturnStatement
        >(node);

        const { expression } = originalNode;

        if (!expression) {
          return;
        }

        test(node, expression);
      },
    };
  },
});

/*
/**
 * @fileoverview Disallows unnecessary `return await`
 * @author Jordan Harband
 *
"use strict";

const astUtils = require("./utils/ast-utils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const message = "Redundant use of `await` on a return value.";

module.exports = {
    meta: {
        type: "suggestion",

        docs: {
            description: "disallow unnecessary `return await`",
            category: "Best Practices",

            recommended: false,

            url: "https://eslint.org/docs/rules/no-return-await"
        },

        fixable: null,

        schema: [
        ]
    },

    create(context) {

        /**
         * Reports a found unnecessary `await` expression.
         * @param {ASTNode} node The node representing the `await` expression to report
         * @returns {void}
         *
        function reportUnnecessaryAwait(node) {
            context.report({
                node: context.getSourceCode().getFirstToken(node),
                loc: node.loc,
                message
            });
        }

        /**
         * Determines whether a thrown error from this node will be caught/handled within this function rather than immediately halting
         * this function. For example, a statement in a `try` block will always have an error handler. A statement in
         * a `catch` block will only have an error handler if there is also a `finally` block.
         * @param {ASTNode} node A node representing a location where an could be thrown
         * @returns {boolean} `true` if a thrown error will be caught/handled in this function
         *
        function hasErrorHandler(node) {
            let ancestor = node;

            while (!astUtils.isFunction(ancestor) && ancestor.type !== "Program") {
                if (ancestor.parent.type === "TryStatement" && (ancestor === ancestor.parent.block || ancestor === ancestor.parent.handler && ancestor.parent.finalizer)) {
                    return true;
                }
                ancestor = ancestor.parent;
            }
            return false;
        }

        /**
         * Checks if a node is placed in tail call position. Once `return` arguments (or arrow function expressions) can be a complex expression,
         * an `await` expression could or could not be unnecessary by the definition of this rule. So we're looking for `await` expressions that are in tail position.
         * @param {ASTNode} node A node representing the `await` expression to check
         * @returns {boolean} The checking result
         *
        function isInTailCallPosition(node) {
            if (node.parent.type === "ArrowFunctionExpression") {
                return true;
            }
            if (node.parent.type === "ReturnStatement") {
                return !hasErrorHandler(node.parent);
            }
            if (node.parent.type === "ConditionalExpression" && (node === node.parent.consequent || node === node.parent.alternate)) {
                return isInTailCallPosition(node.parent);
            }
            if (node.parent.type === "LogicalExpression" && node === node.parent.right) {
                return isInTailCallPosition(node.parent);
            }
            if (node.parent.type === "SequenceExpression" && node === node.parent.expressions[node.parent.expressions.length - 1]) {
                return isInTailCallPosition(node.parent);
            }
            return false;
        }

        return {
            AwaitExpression(node) {
                if (isInTailCallPosition(node) && !hasErrorHandler(node)) {
                    reportUnnecessaryAwait(node);
                }
            }
        };
    }
};
*/
