// any is required to work around manipulating the AST in weird ways
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AST_NODE_TYPES,
  TSESTree,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-extra-parens';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-extra-parens',
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow unnecessary parentheses',
      category: 'Possible Errors',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'code',
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['all'],
  create(context) {
    const rules = baseRule.create(context);

    function binaryExp(
      node: TSESTree.BinaryExpression | TSESTree.LogicalExpression,
    ): void {
      const rule = rules.BinaryExpression as (n: typeof node) => void;

      // makes the rule think it should skip the left or right
      const isLeftTypeAssertion = util.isTypeAssertion(node.left);
      const isRightTypeAssertion = util.isTypeAssertion(node.right);
      if (isLeftTypeAssertion && isRightTypeAssertion) {
        return; // ignore
      }
      if (isLeftTypeAssertion) {
        return rule({
          ...node,
          left: {
            ...node.left,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
      }
      if (isRightTypeAssertion) {
        return rule({
          ...node,
          right: {
            ...node.right,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
      }

      return rule(node);
    }
    function callExp(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const rule = rules.CallExpression as (n: typeof node) => void;

      if (util.isTypeAssertion(node.callee)) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        return rule({
          ...node,
          callee: {
            ...node.callee,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
      }

      if (
        node.arguments.length === 1 &&
        node.typeParameters?.params.some(
          param =>
            param.type === AST_NODE_TYPES.TSParenthesizedType ||
            param.type === AST_NODE_TYPES.TSImportType,
        )
      ) {
        return rule({
          ...node,
          arguments: [
            {
              ...node.arguments[0],
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          ],
        });
      }

      return rule(node);
    }
    function unaryUpdateExpression(
      node: TSESTree.UnaryExpression | TSESTree.UpdateExpression,
    ): void {
      const rule = rules.UnaryExpression as (n: typeof node) => void;

      if (util.isTypeAssertion(node.argument)) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        return rule({
          ...node,
          argument: {
            ...node.argument,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
      }

      return rule(node);
    }

    const overrides: TSESLint.RuleListener = {
      // ArrayExpression
      ArrowFunctionExpression(node) {
        if (!util.isTypeAssertion(node.body)) {
          return rules.ArrowFunctionExpression(node);
        }
      },
      // AssignmentExpression
      // AwaitExpression
      BinaryExpression: binaryExp,
      CallExpression: callExp,
      // ClassDeclaration
      // ClassExpression
      ConditionalExpression(node) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        if (util.isTypeAssertion(node.test)) {
          return rules.ConditionalExpression({
            ...node,
            test: {
              ...node.test,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }
        if (util.isTypeAssertion(node.consequent)) {
          return rules.ConditionalExpression({
            ...node,
            consequent: {
              ...node.consequent,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }
        if (util.isTypeAssertion(node.alternate)) {
          // reduces the precedence of the node so the rule thinks it needs to be rapped
          return rules.ConditionalExpression({
            ...node,
            alternate: {
              ...node.alternate,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }
        return rules.ConditionalExpression(node);
      },
      // DoWhileStatement
      'ForInStatement, ForOfStatement'(
        node: TSESTree.ForInStatement | TSESTree.ForOfStatement,
      ) {
        if (util.isTypeAssertion(node.right)) {
          // makes the rule skip checking of the right
          return rules['ForInStatement, ForOfStatement']({
            ...node,
            type: AST_NODE_TYPES.ForOfStatement as any,
            right: {
              ...node.right,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }

        return rules['ForInStatement, ForOfStatement'](node);
      },
      ForStatement(node) {
        // make the rule skip the piece by removing it entirely
        if (node.init && util.isTypeAssertion(node.init)) {
          return rules.ForStatement({
            ...node,
            init: null,
          });
        }
        if (node.test && util.isTypeAssertion(node.test)) {
          return rules.ForStatement({
            ...node,
            test: null,
          });
        }
        if (node.update && util.isTypeAssertion(node.update)) {
          return rules.ForStatement({
            ...node,
            update: null,
          });
        }

        return rules.ForStatement(node);
      },
      'ForStatement > *.init:exit'(node: TSESTree.Node) {
        if (!util.isTypeAssertion(node)) {
          return rules['ForStatement > *.init:exit'](node);
        }
      },
      // IfStatement
      LogicalExpression: binaryExp,
      MemberExpression(node) {
        if (util.isTypeAssertion(node.object)) {
          // reduces the precedence of the node so the rule thinks it needs to be wrapped
          return rules.MemberExpression({
            ...node,
            object: {
              ...node.object,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }

        return rules.MemberExpression(node);
      },
      NewExpression: callExp,
      // ObjectExpression
      // ReturnStatement
      // SequenceExpression
      SpreadElement(node) {
        if (!util.isTypeAssertion(node.argument)) {
          return rules.SpreadElement(node);
        }
      },
      SwitchCase(node) {
        if (node.test && !util.isTypeAssertion(node.test)) {
          return rules.SwitchCase(node);
        }
      },
      // SwitchStatement
      ThrowStatement(node) {
        if (node.argument && !util.isTypeAssertion(node.argument)) {
          return rules.ThrowStatement(node);
        }
      },
      UnaryExpression: unaryUpdateExpression,
      UpdateExpression: unaryUpdateExpression,
      // VariableDeclarator
      // WhileStatement
      // WithStatement - i'm not going to even bother implementing this terrible and never used feature
      YieldExpression(node) {
        if (node.argument && !util.isTypeAssertion(node.argument)) {
          return rules.YieldExpression(node);
        }
      },
    };
    return Object.assign({}, rules, overrides);
  },
});
