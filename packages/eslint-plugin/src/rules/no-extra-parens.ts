import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import baseRule from 'eslint/lib/rules/no-extra-parens';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-extra-parens',
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow unnecessary parentheses',
      category: 'Possible Errors',
      recommended: false,
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
    ) {
      const rule = rules.BinaryExpression as (n: typeof node) => void;

      // makes the rule think it should skip the left or right
      if (node.left.type === AST_NODE_TYPES.TSAsExpression) {
        return rule({
          ...node,
          left: {
            ...node.left,
            type: AST_NODE_TYPES.BinaryExpression as any,
          },
        });
      }
      if (node.right.type === AST_NODE_TYPES.TSAsExpression) {
        return rule({
          ...node,
          right: {
            ...node.right,
            type: AST_NODE_TYPES.BinaryExpression as any,
          },
        });
      }

      return rule(node);
    }
    function callExp(node: TSESTree.CallExpression | TSESTree.NewExpression) {
      const rule = rules.CallExpression as (n: typeof node) => void;

      if (node.callee.type === AST_NODE_TYPES.TSAsExpression) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        return rule({
          ...node,
          callee: {
            ...node.callee,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
      }

      return rule(node);
    }
    function unaryUpdateExpression(
      node: TSESTree.UnaryExpression | TSESTree.UpdateExpression,
    ) {
      const rule = rules.UnaryExpression as (n: typeof node) => void;

      if (node.argument.type === AST_NODE_TYPES.TSAsExpression) {
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

    return Object.assign({}, rules, {
      // ArrayExpression
      ArrowFunctionExpression(node) {
        if (node.body.type !== AST_NODE_TYPES.TSAsExpression) {
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
        if (node.test.type === AST_NODE_TYPES.TSAsExpression) {
          return rules.ConditionalExpression({
            ...node,
            test: {
              ...node.test,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }
        if (node.consequent.type === AST_NODE_TYPES.TSAsExpression) {
          return rules.ConditionalExpression({
            ...node,
            consequent: {
              ...node.consequent,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
        }
        if (node.alternate.type === AST_NODE_TYPES.TSAsExpression) {
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
        if (node.right.type === AST_NODE_TYPES.TSAsExpression) {
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
        if (node.init && node.init.type === AST_NODE_TYPES.TSAsExpression) {
          return rules.ForStatement({
            ...node,
            init: null,
          });
        }
        if (node.test && node.test.type === AST_NODE_TYPES.TSAsExpression) {
          return rules.ForStatement({
            ...node,
            test: null,
          });
        }
        if (node.update && node.update.type === AST_NODE_TYPES.TSAsExpression) {
          return rules.ForStatement({
            ...node,
            update: null,
          });
        }

        return rules.ForStatement(node);
      },
      // IfStatement
      LogicalExpression: binaryExp,
      MemberExpression(node) {
        if (node.object.type === AST_NODE_TYPES.TSAsExpression) {
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
        if (node.argument.type !== AST_NODE_TYPES.TSAsExpression) {
          return rules.SpreadElement(node);
        }
      },
      SwitchCase(node) {
        if (node.test.type !== AST_NODE_TYPES.TSAsExpression) {
          return rules.SwitchCase(node);
        }
      },
      // SwitchStatement
      ThrowStatement(node) {
        if (
          node.argument &&
          node.argument.type !== AST_NODE_TYPES.TSAsExpression
        ) {
          return rules.ThrowStatement(node);
        }
      },
      UnaryExpression: unaryUpdateExpression,
      UpdateExpression: unaryUpdateExpression,
      // VariableDeclarator
      // WhileStatement
      // WithStatement - i'm not going to even bother implementing this terrible and never used feature
      YieldExpression(node) {
        if (
          node.argument &&
          node.argument.type !== AST_NODE_TYPES.TSAsExpression
        ) {
          return rules.YieldExpression(node);
        }
      },
    });
  },
});
