import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule } from '../util';

export type Options = [
  {
    checkNever: boolean;
  },
];

function isMeaninglessVoidArgument(node: TSESTree.Expression): boolean {
  // `void` is meaningless on expressions that don't produce a value via a
  // side-effecting operation (call, new, await, yield). Without one of those,
  // there is no return value to discard.
  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.MemberExpression:
      return true;
    case AST_NODE_TYPES.ChainExpression:
      return isMeaninglessVoidArgument(node.expression);
    default:
      return false;
  }
}

export default createRule<Options, 'meaninglessVoidOperator' | 'removeVoid'>({
  name: 'no-meaningless-void-operator',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the `void` operator except when used to discard a value',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      meaninglessVoidOperator:
        "void operator shouldn't be used on {{type}}; it should convey that a return value is being ignored",
      removeVoid: "Remove 'void'",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkNever: {
            type: 'boolean',
            description:
              'Whether to suggest removing `void` when the argument has type `never`.',
          },
        },
      },
    ],
  },
  defaultOptions: [{ checkNever: false }],

  create(context, [{ checkNever }]) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      'UnaryExpression[operator="void"]'(node: TSESTree.UnaryExpression): void {
        const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
          return fixer.removeRange([
            context.sourceCode.getTokens(node)[0].range[0],
            context.sourceCode.getTokens(node)[1].range[0],
          ]);
        };

        const argType = services.getTypeAtLocation(node.argument);
        const unionParts = tsutils.unionConstituents(argType);
        if (
          unionParts.every(part =>
            tsutils.isTypeFlagSet(
              part,
              ts.TypeFlags.Void | ts.TypeFlags.Undefined,
            ),
          )
        ) {
          context.report({
            node,
            messageId: 'meaninglessVoidOperator',
            data: { type: checker.typeToString(argType) },
            fix,
          });
        } else if (
          checkNever &&
          unionParts.every(part =>
            tsutils.isTypeFlagSet(
              part,
              ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Never,
            ),
          )
        ) {
          context.report({
            node,
            messageId: 'meaninglessVoidOperator',
            data: { type: checker.typeToString(argType) },
            suggest: [{ messageId: 'removeVoid', fix }],
          });
        } else if (isMeaninglessVoidArgument(node.argument)) {
          // Issue #12214: argument is an identifier or member access (no call,
          // new, await, or yield). There is no return value to discard, so
          // `void` is meaningless. Skip when the argument is `never` without
          // `checkNever`, to preserve that option's explicit opt-in semantics.
          const isOnlyNever = unionParts.every(part =>
            tsutils.isTypeFlagSet(part, ts.TypeFlags.Never),
          );
          if (!isOnlyNever || checkNever) {
            context.report({
              node,
              messageId: 'meaninglessVoidOperator',
              data: { type: checker.typeToString(argType) },
              fix,
            });
          }
        }
      },
    };
  },
});
