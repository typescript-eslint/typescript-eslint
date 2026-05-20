import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { Awaitable, createRule, needsToBeAwaited } from '../util';

export type Options = [
  {
    checkNever: boolean;
  },
];

export default createRule<Options, 'meaninglessVoidOperator' | 'removeVoid'>({
  name: 'no-meaningless-void-operator',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the `void` operator except when used to ignore a Promise-like value',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      meaninglessVoidOperator:
        "void operator shouldn't be used on {{type}}; it should convey that a Promise-like value is intentionally not awaited",
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
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.argument);
        const unionParts = tsutils.unionConstituents(argType);
        const isVoidOrUndefined = unionParts.every(part =>
          tsutils.isTypeFlagSet(
            part,
            ts.TypeFlags.Void | ts.TypeFlags.Undefined,
          ),
        );
        const isNeverOrVoidOrUndefined = unionParts.every(part =>
          tsutils.isTypeFlagSet(
            part,
            ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Never,
          ),
        );

        if (
          isVoidOrUndefined ||
          (!isNeverOrVoidOrUndefined &&
            node.parent.type === AST_NODE_TYPES.ExpressionStatement &&
            unionParts.every(
              part =>
                needsToBeAwaited(checker, tsNode, part) === Awaitable.Never,
            ))
        ) {
          context.report({
            node,
            messageId: 'meaninglessVoidOperator',
            data: { type: checker.typeToString(argType) },
            fix,
          });
        } else if (checkNever && isNeverOrVoidOrUndefined) {
          context.report({
            node,
            messageId: 'meaninglessVoidOperator',
            data: { type: checker.typeToString(argType) },
            suggest: [{ messageId: 'removeVoid', fix }],
          });
        }
      },
    };
  },
});
