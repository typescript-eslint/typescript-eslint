import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-confusing-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow non-null assertion in locations that may be confusing',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      confusingEqual:
        'Confusing combinations of non-null assertion and equal test like "a! == b", which looks very similar to not equal "a !== b"',
      confusingAssign:
        'Confusing combinations of non-null assertion and equal test like "a! = b", which looks very similar to not equal "a != b"',
      notNeedInEqualTest: 'Unnecessary non-null assertion (!) in equal test',
      notNeedInAssign:
        'Unnecessary non-null assertion (!) in assignment left hand',
      wrapUpLeft:
        'Wrap up left hand to avoid putting non-null assertion "!" and "=" together',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      'BinaryExpression, AssignmentExpression'(
        node: TSESTree.BinaryExpression | TSESTree.AssignmentExpression,
      ): void {
        function isLeftHandPrimaryExpression(
          node: TSESTree.Expression,
        ): boolean {
          return node.type === AST_NODE_TYPES.TSNonNullExpression;
        }

        if (
          node.operator === '==' ||
          node.operator === '===' ||
          node.operator === '='
        ) {
          const isAssign = node.operator === '=';
          const leftHandFinalToken = sourceCode.getLastToken(node.left);
          const tokenAfterLeft = sourceCode.getTokenAfter(node.left);
          if (
            leftHandFinalToken?.type === AST_TOKEN_TYPES.Punctuator &&
            leftHandFinalToken?.value === '!' &&
            tokenAfterLeft?.value !== ')'
          ) {
            if (isLeftHandPrimaryExpression(node.left)) {
              context.report({
                node,
                messageId: isAssign ? 'confusingAssign' : 'confusingEqual',
                suggest: [
                  {
                    messageId: isAssign
                      ? 'notNeedInAssign'
                      : 'notNeedInEqualTest',
                    fix: (fixer): TSESLint.RuleFix[] => [
                      fixer.remove(leftHandFinalToken),
                    ],
                  },
                ],
              });
            } else {
              context.report({
                node,
                messageId: isAssign ? 'confusingAssign' : 'confusingEqual',
                suggest: [
                  {
                    messageId: 'wrapUpLeft',
                    fix: (fixer): TSESLint.RuleFix[] => [
                      fixer.insertTextBefore(node.left, '('),
                      fixer.insertTextAfter(node.left, ')'),
                    ],
                  },
                ],
              });
            }
          }
        }
      },
    };
  },
});
