// any is required to work around manipulating the AST in weird ways
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-extra-parens');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-extra-parens',
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow unnecessary parentheses',
      extendsBaseRule: true,
    },
    fixable: 'code',
    hasSuggestions: baseRule.meta.hasSuggestions,
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
        rule({
          ...node,
          left: {
            ...node.left,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
        return;
      }
      if (isRightTypeAssertion) {
        rule({
          ...node,
          right: {
            ...node.right,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
        return;
      }

      rule(node);
    }
    function callExp(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const rule = rules.CallExpression as (n: typeof node) => void;

      if (util.isTypeAssertion(node.callee)) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        rule({
          ...node,
          callee: {
            ...node.callee,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
        return;
      }

      if (
        node.arguments.length === 1 &&
        node.typeArguments?.params.some(
          param =>
            param.type === AST_NODE_TYPES.TSImportType ||
            param.type === AST_NODE_TYPES.TSArrayType,
        )
      ) {
        rule({
          ...node,
          arguments: [
            {
              ...node.arguments[0],
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          ],
        });
        return;
      }

      rule(node);
    }
    function unaryUpdateExpression(
      node: TSESTree.UnaryExpression | TSESTree.UpdateExpression,
    ): void {
      const rule = rules.UnaryExpression as (n: typeof node) => void;

      if (util.isTypeAssertion(node.argument)) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        rule({
          ...node,
          argument: {
            ...node.argument,
            type: AST_NODE_TYPES.SequenceExpression as any,
          },
        });
        return;
      }

      rule(node);
    }

    const overrides: TSESLint.RuleListener = {
      // ArrayExpression
      ArrowFunctionExpression(node) {
        if (!util.isTypeAssertion(node.body)) {
          rules.ArrowFunctionExpression(node);
          return;
        }
      },
      // AssignmentExpression
      AwaitExpression(node) {
        if (util.isTypeAssertion(node.argument)) {
          // reduces the precedence of the node so the rule thinks it needs to be wrapped
          rules.AwaitExpression({
            ...node,
            argument: {
              ...node.argument,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }
        rules.AwaitExpression(node);
      },
      BinaryExpression: binaryExp,
      CallExpression: callExp,
      ClassDeclaration(node) {
        if (node.superClass?.type === AST_NODE_TYPES.TSAsExpression) {
          rules.ClassDeclaration({
            ...node,
            superClass: {
              ...node.superClass,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }
        rules.ClassDeclaration(node);
      },
      ClassExpression(node) {
        if (node.superClass?.type === AST_NODE_TYPES.TSAsExpression) {
          rules.ClassExpression({
            ...node,
            superClass: {
              ...node.superClass,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }
        rules.ClassExpression(node);
      },
      ConditionalExpression(node) {
        // reduces the precedence of the node so the rule thinks it needs to be wrapped
        if (util.isTypeAssertion(node.test)) {
          rules.ConditionalExpression({
            ...node,
            test: {
              ...node.test,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }
        if (util.isTypeAssertion(node.consequent)) {
          rules.ConditionalExpression({
            ...node,
            consequent: {
              ...node.consequent,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }
        if (util.isTypeAssertion(node.alternate)) {
          // reduces the precedence of the node so the rule thinks it needs to be wrapped
          rules.ConditionalExpression({
            ...node,
            alternate: {
              ...node.alternate,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }
        rules.ConditionalExpression(node);
      },
      // DoWhileStatement
      // ForIn and ForOf are guarded by eslint version
      ForStatement(node) {
        // make the rule skip the piece by removing it entirely
        if (node.init && util.isTypeAssertion(node.init)) {
          rules.ForStatement({
            ...node,
            init: null,
          });
          return;
        }
        if (node.test && util.isTypeAssertion(node.test)) {
          rules.ForStatement({
            ...node,
            test: null,
          });
          return;
        }
        if (node.update && util.isTypeAssertion(node.update)) {
          rules.ForStatement({
            ...node,
            update: null,
          });
          return;
        }

        rules.ForStatement(node);
      },
      'ForStatement > *.init:exit'(node: TSESTree.Node) {
        if (!util.isTypeAssertion(node)) {
          rules['ForStatement > *.init:exit'](node);
          return;
        }
      },
      // IfStatement
      LogicalExpression: binaryExp,
      MemberExpression(node) {
        if (util.isTypeAssertion(node.object)) {
          // reduces the precedence of the node so the rule thinks it needs to be wrapped
          rules.MemberExpression({
            ...node,
            object: {
              ...node.object,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }

        rules.MemberExpression(node);
      },
      NewExpression: callExp,
      // ObjectExpression
      // ReturnStatement
      // SequenceExpression
      SpreadElement(node) {
        if (!util.isTypeAssertion(node.argument)) {
          rules.SpreadElement(node);
          return;
        }
      },
      SwitchCase(node) {
        if (node.test && !util.isTypeAssertion(node.test)) {
          rules.SwitchCase(node);
          return;
        }
      },
      // SwitchStatement
      ThrowStatement(node) {
        if (node.argument && !util.isTypeAssertion(node.argument)) {
          rules.ThrowStatement(node);
          return;
        }
      },
      UnaryExpression: unaryUpdateExpression,
      UpdateExpression: unaryUpdateExpression,
      // VariableDeclarator
      // WhileStatement
      // WithStatement - i'm not going to even bother implementing this terrible and never used feature
      YieldExpression(node) {
        if (node.argument && !util.isTypeAssertion(node.argument)) {
          rules.YieldExpression(node);
          return;
        }
      },
    };
    if (rules.ForInStatement && rules.ForOfStatement) {
      overrides.ForInStatement = function (node): void {
        if (util.isTypeAssertion(node.right)) {
          // as of 7.20.0 there's no way to skip checking the right of the ForIn
          // so just don't validate it at all
          return;
        }

        rules.ForInStatement(node);
      };
      overrides.ForOfStatement = function (node): void {
        if (util.isTypeAssertion(node.right)) {
          // makes the rule skip checking of the right
          rules.ForOfStatement({
            ...node,
            type: AST_NODE_TYPES.ForOfStatement,
            right: {
              ...node.right,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }

        rules.ForOfStatement(node);
      };
    } else {
      overrides['ForInStatement, ForOfStatement'] = function (
        node: TSESTree.ForInStatement | TSESTree.ForOfStatement,
      ): void {
        if (util.isTypeAssertion(node.right)) {
          // makes the rule skip checking of the right
          rules['ForInStatement, ForOfStatement']({
            ...node,
            type: AST_NODE_TYPES.ForOfStatement as any,
            right: {
              ...node.right,
              type: AST_NODE_TYPES.SequenceExpression as any,
            },
          });
          return;
        }

        rules['ForInStatement, ForOfStatement'](node);
      };
    }
    return Object.assign({}, rules, overrides);
  },
});
