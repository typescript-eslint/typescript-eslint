import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type {
  ReportDescriptor,
  RuleFix,
} from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type MessageId =
  | 'confusingAssign'
  | 'confusingEqual'
  | 'confusingOperator'
  | 'notNeedInAssign'
  | 'notNeedInEqualTest'
  | 'notNeedInOperator'
  | 'wrapUpLeft';

const confusingOperators = new Set([
  '=',
  '==',
  '===',
  'in',
  'instanceof',
] as const);
type ConfusingOperator =
  typeof confusingOperators extends Set<infer T> ? T : never;

function isConfusingOperator(operator: string): operator is ConfusingOperator {
  return confusingOperators.has(operator as ConfusingOperator);
}

export default createRule<[], MessageId>({
  name: 'no-confusing-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      recommended: 'stylistic',
      description:
        'Disallow non-null assertion in locations that may be confusing',
    },
    hasSuggestions: true,
    messages: {
      confusingAssign:
        'Confusing combination of non-null assertion and assignment like `a! = b`, which looks very similar to `a != b`.',
      confusingEqual:
        'Confusing combination of non-null assertion and equality test like `a! == b`, which looks very similar to `a !== b`.',
      confusingOperator:
        'Confusing combination of non-null assertion and `{{operator}}` operator like `a! {{operator}} b`, which might be misinterpreted as `!(a {{operator}} b)`.',

      notNeedInAssign:
        'Remove unnecessary non-null assertion (!) in assignment left-hand side.',
      notNeedInEqualTest:
        'Remove unnecessary non-null assertion (!) in equality test.',

      notNeedInOperator:
        'Remove possibly unnecessary non-null assertion (!) in the left operand of the `{{operator}}` operator.',

      wrapUpLeft:
        'Wrap the left-hand side in parentheses to avoid confusion with "{{operator}}" operator.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function confusingOperatorToMessageData(
      operator: ConfusingOperator,
    ): Pick<ReportDescriptor<MessageId>, 'data' | 'messageId'> {
      switch (operator) {
        case '=':
          return {
            messageId: 'confusingAssign',
          };
        case '==':
        case '===':
          return {
            messageId: 'confusingEqual',
          };
        case 'in':
        case 'instanceof':
          return {
            messageId: 'confusingOperator',
            data: { operator },
          };
        // istanbul ignore next
        default:
          operator satisfies never;
          throw new Error(`Unexpected operator ${operator as string}`);
      }
    }

    return {
      'BinaryExpression, AssignmentExpression'(
        node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
      ): void {
        const operator = node.operator;

        if (isConfusingOperator(operator)) {
          // Look for a non-null assertion as the last token on the left hand side.
          // That way, we catch things like `1 + two! === 3`, even though the left
          // hand side isn't a non-null assertion AST node.
          const leftHandFinalToken = context.sourceCode.getLastToken(node.left);
          const tokenAfterLeft = context.sourceCode.getTokenAfter(node.left);
          if (
            leftHandFinalToken?.type === AST_TOKEN_TYPES.Punctuator &&
            leftHandFinalToken.value === '!' &&
            tokenAfterLeft?.value !== ')'
          ) {
            if (node.left.type === AST_NODE_TYPES.TSNonNullExpression) {
              let suggestions: TSESLint.SuggestionReportDescriptor<MessageId>[];
              switch (operator) {
                case '=':
                  suggestions = [
                    {
                      messageId: 'notNeedInAssign',
                      fix: (fixer): RuleFix => fixer.remove(leftHandFinalToken),
                    },
                  ];
                  break;

                case '==':
                case '===':
                  suggestions = [
                    {
                      messageId: 'notNeedInEqualTest',
                      fix: (fixer): RuleFix => fixer.remove(leftHandFinalToken),
                    },
                  ];
                  break;

                case 'in':
                case 'instanceof':
                  suggestions = [
                    {
                      messageId: 'notNeedInOperator',
                      data: { operator },
                      fix: (fixer): RuleFix => fixer.remove(leftHandFinalToken),
                    },
                    {
                      messageId: 'wrapUpLeft',
                      data: { operator },
                      fix: wrapUpLeftFixer(node),
                    },
                  ];
                  break;

                // istanbul ignore next
                default:
                  operator satisfies never;
                  return;
              }
              context.report({
                node,
                ...confusingOperatorToMessageData(operator),
                suggest: suggestions,
              });
            } else {
              context.report({
                node,
                ...confusingOperatorToMessageData(operator),
                suggest: [
                  {
                    messageId: 'wrapUpLeft',
                    data: { operator },
                    fix: wrapUpLeftFixer(node),
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

function wrapUpLeftFixer(
  node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
): TSESLint.ReportFixFunction {
  return (fixer): TSESLint.RuleFix[] => [
    fixer.insertTextBefore(node.left, '('),
    fixer.insertTextAfter(node.left, ')'),
  ];
}
