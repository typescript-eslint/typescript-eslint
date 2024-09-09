import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { ESLintUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule } from '../util';

type Options = [
  {
    checkNever: boolean;
  },
];

export default createRule<Options, 'meaninglessVoidOperator' | 'removeVoid'>({
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
        const unionParts = tsutils.unionTypeParts(argType);
        if (
          unionParts.every(
            part => part.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined),
          )
        ) {
          context.report({
            data: { type: checker.typeToString(argType) },
            fix,
            messageId: 'meaninglessVoidOperator',
            node,
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
            data: { type: checker.typeToString(argType) },
            messageId: 'meaninglessVoidOperator',
            node,
            suggest: [{ fix, messageId: 'removeVoid' }],
          });
        }
      },
    };
  },
  defaultOptions: [{ checkNever: false }],
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
            default: false,
          },
        },
      },
    ],
  },
  name: 'no-meaningless-void-operator',
});
