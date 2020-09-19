import {
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/space-infix-ops';
import * as util from '../util';

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'space-infix-ops',
  meta: {
    type: 'layout',
    docs: {
      description:
        'This rule is aimed at ensuring there are spaces around infix operators.',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: baseRule.meta.fixable,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages ?? {
      missingSpace: "Operator '{{operator}}' must be spaced.",
    },
  },
  defaultOptions: [
    {
      int32Hint: false,
    },
  ],
  create(context) {
    const rules = baseRule.create(context);
    const sourceCode = context.getSourceCode();

    /**
     * Check if it has an assignment char and report if it's faulty
     * @param node The node to report
     */
    function checkForAssignmentSpace(node: TSESTree.TSEnumMember): void {
      if (!node.initializer) {
        return;
      }

      const leftNode = sourceCode.getTokenByRangeStart(node.id.range[0])!;
      const rightNode = sourceCode.getTokenByRangeStart(
        node.initializer.range[0],
      )!;

      if (!rightNode) {
        return;
      }

      const operator = sourceCode.getFirstTokenBetween(
        leftNode,
        rightNode,
        token =>
          token.type === AST_TOKEN_TYPES.Punctuator && token.value === '=',
      );
      const prev = sourceCode.getTokenBefore(operator!);
      const next = sourceCode.getTokenAfter(operator!);

      if (
        operator &&
        (!sourceCode.isSpaceBetweenTokens(prev!, operator) ||
          !sourceCode.isSpaceBetweenTokens(operator, next!))
      ) {
        context.report({
          node: node,
          loc: operator.loc,
          messageId: 'missingSpace',
          data: {
            operator: operator.value,
          },
          fix(fixer) {
            const previousToken = sourceCode.getTokenBefore(operator);
            const afterToken = sourceCode.getTokenAfter(operator);
            let fixString = '';

            if (operator.range[0] - previousToken!.range[1] === 0) {
              fixString = ' ';
            }

            fixString += operator.value;

            if (afterToken!.range[0] - operator.range[1] === 0) {
              fixString += ' ';
            }

            return fixer.replaceText(operator, fixString);
          },
        });
      }
    }

    return {
      ...rules,
      TSEnumMember: checkForAssignmentSpace,
    };
  },
});
