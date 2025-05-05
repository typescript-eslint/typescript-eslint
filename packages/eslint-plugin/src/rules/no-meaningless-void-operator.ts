import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { ESLintUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule } from '../util';

export type Options = [
  {
    checkNever: boolean;
  },
];

export default createRule<Options, 'meaninglessVoidOperator' | 'removeVoid'>({
  name: 'no-meaningless-void-operator',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      recommended: 'strict',
      description:
        'Disallow the `void` operator except when used to discard a value',
      requiresTypeChecking: true,
    },
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
            default: false,
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
          unionParts.every(
            part => part.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined),
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
          unionParts.every(
            part =>
              part.flags &
              (ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Never),
          )
        ) {
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
