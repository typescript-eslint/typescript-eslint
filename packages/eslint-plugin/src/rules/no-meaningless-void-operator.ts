import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import * as tools from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    checkNever: boolean;
  },
];

export default util.createRule<
  Options,
  'meaninglessVoidOperator' | 'removeVoid'
>({
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
        properties: {
          checkNever: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ checkNever: false }],

  create(context, [{ checkNever }]) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    return {
      'UnaryExpression[operator="void"]'(node: TSESTree.UnaryExpression): void {
        const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
          return fixer.removeRange([
            sourceCode.getTokens(node)[0].range[0],
            sourceCode.getTokens(node)[1].range[0],
          ]);
        };

        const argType = services.getTypeAtLocation(node.argument);
        const unionParts = tools.unionTypeParts(argType);
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
