import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  isStartOfArrowFunctionBodyNeedingParentheses,
  isStartOfExpressionStatement,
  isStartOfExpressionStatementNeedingParentheses,
  isTokenOnSameLine,
  needsPrecedingSemicolon,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
  {
    checkNever: boolean;
  },
];

export default createRule<
  Options,
  'meaninglessVoidOnNonCall' | 'meaninglessVoidOperator' | 'removeVoid'
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
      meaninglessVoidOnNonCall:
        "void operator is useless here; it should only discard a call's return value",
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
              "Whether to suggest removing `void` when a call's return type is `never`.",
          },
        },
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [{ checkNever: false }],

  create(context, [{ checkNever }]) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      'UnaryExpression[operator="void"]'(node: TSESTree.UnaryExpression): void {
        const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
          const voidToken = nullThrows(
            context.sourceCode.getFirstToken(node),
            NullThrowsReasons.MissingToken('void', 'void expression'),
          );
          const argumentToken = nullThrows(
            context.sourceCode.getTokenAfter(voidToken),
            NullThrowsReasons.MissingToken('argument', 'void expression'),
          );
          const voidRange: TSESTree.Range = [
            voidToken.range[0],
            // Keeping a comment that spans a line break would end a
            // `return`, `throw` or `yield` before the argument.
            (isTokenOnSameLine(voidToken, argumentToken)
              ? nullThrows(
                  context.sourceCode.getTokenAfter(voidToken, {
                    includeComments: true,
                  }),
                  NullThrowsReasons.MissingToken('argument', 'void expression'),
                )
              : argumentToken
            ).range[0],
          ];

          // Without `void`, a leading `{`, `function`, `async function` or
          // `class` would start a block or declaration instead of an
          // expression.
          const needsParentheses =
            isStartOfExpressionStatementNeedingParentheses(
              node,
              argumentToken,
            ) ||
            // Not a call, so only fixed as a whole statement
            (argumentToken.value === 'async' &&
              context.sourceCode.getTokenAfter(argumentToken)?.value ===
                'function') ||
            isStartOfArrowFunctionBodyNeedingParentheses(
              node,
              argumentToken,
              context.sourceCode,
            );

          // Without `void`, a statement relying on ASI could continue the
          // previous line, as in `a = b\n(c)`.
          const prefix =
            (needsParentheses || /^[-([`+/<]/.test(argumentToken.value)) &&
            isStartOfExpressionStatement(node) &&
            needsPrecedingSemicolon(
              context.sourceCode,
              node,
              needsParentheses ? '(' : argumentToken.value,
            )
              ? ';'
              : '';

          if (needsParentheses) {
            return [
              fixer.replaceTextRange(voidRange, `${prefix}(`),
              fixer.insertTextAfter(node, ')'),
            ];
          }

          return [fixer.replaceTextRange(voidRange, prefix)];
        };

        const inner = unwrapVoidArgument(node.argument);
        if (
          inner.type !== AST_NODE_TYPES.CallExpression &&
          inner.type !== AST_NODE_TYPES.TaggedTemplateExpression
        ) {
          // `void 0` is a common undefined idiom, not a discarded call.
          if (inner.type === AST_NODE_TYPES.Literal && inner.value === 0) {
            return;
          }

          // `void (x = value)` discards the assignment result so the
          // expression evaluates to undefined (e.g. `() => void (x = 1)`).
          if (inner.type === AST_NODE_TYPES.AssignmentExpression) {
            return;
          }

          const tsArgument = services.esTreeNodeToTSNodeMap.get(node.argument);
          const argType = services.getTypeAtLocation(node.argument);
          // Allow `void promiseValue` so this rule does not fight no-floating-promises.
          if (tsutils.isThenableType(checker, tsArgument, argType)) {
            return;
          }

          context.report({
            node,
            messageId: 'meaninglessVoidOnNonCall',
            fix:
              node.parent.type === AST_NODE_TYPES.ExpressionStatement
                ? fix
                : undefined,
          });
          return;
        }

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
        }
      },
    };
  },
});

function unwrapVoidArgument(node: TSESTree.Expression): TSESTree.Expression {
  let current = node;
  while (true) {
    switch (current.type) {
      case AST_NODE_TYPES.ChainExpression:
      case AST_NODE_TYPES.TSAsExpression:
      case AST_NODE_TYPES.TSNonNullExpression:
      case AST_NODE_TYPES.TSSatisfiesExpression:
      case AST_NODE_TYPES.TSTypeAssertion:
        current = current.expression;
        continue;

      case AST_NODE_TYPES.SequenceExpression:
        current = nullThrows(
          current.expressions.at(-1),
          'Expected SequenceExpression to have at least one expression',
        );
        continue;

      default:
        return current;
    }
  }
}
