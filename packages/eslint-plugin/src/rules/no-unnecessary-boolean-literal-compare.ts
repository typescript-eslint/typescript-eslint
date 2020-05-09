import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

type MessageIds = 'direct' | 'negated';

interface BooleanComparison {
  expression: TSESTree.Expression;
  forTruthy: boolean;
  negated: boolean;
  range: [number, number];
}

export default util.createRule<[], MessageIds>({
  name: 'no-unnecessary-boolean-literal-compare',
  meta: {
    docs: {
      description:
        'Flags unnecessary equality comparisons against boolean literals',
      category: 'Stylistic Issues',
      recommended: false,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      direct:
        'This expression unnecessarily compares a boolean value to a boolean instead of using it directly.',
      negated:
        'This expression unnecessarily compares a boolean value to a boolean instead of negating it.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function getBooleanComparison(
      node: TSESTree.BinaryExpression,
    ): BooleanComparison | undefined {
      const comparison = deconstructComparison(node);
      if (!comparison) {
        return undefined;
      }

      const expressionType = checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(comparison.expression),
      );

      if (
        !tsutils.isTypeFlagSet(
          expressionType,
          ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral,
        )
      ) {
        return undefined;
      }

      return comparison;
    }

    function deconstructComparison(
      node: TSESTree.BinaryExpression,
    ): BooleanComparison | undefined {
      const comparisonType = util.getEqualsKind(node.operator);
      if (!comparisonType) {
        return undefined;
      }

      for (const [against, expression] of [
        [node.right, node.left],
        [node.left, node.right],
      ]) {
        if (
          against.type !== AST_NODE_TYPES.Literal ||
          typeof against.value !== 'boolean'
        ) {
          continue;
        }

        const { value } = against;
        const negated = node.operator.startsWith('!');

        return {
          forTruthy: value ? !negated : negated,
          expression,
          negated,
          range:
            expression.range[0] < against.range[0]
              ? [expression.range[1], against.range[1]]
              : [against.range[1], expression.range[1]],
        };
      }

      return undefined;
    }

    return {
      BinaryExpression(node): void {
        const comparison = getBooleanComparison(node);

        if (comparison) {
          context.report({
            fix: function* (fixer) {
              yield fixer.removeRange(comparison.range);

              if (!comparison.forTruthy) {
                yield fixer.insertTextBefore(node, '!');
              }
            },
            messageId: comparison.negated ? 'negated' : 'direct',
            node,
          });
        }
      },
    };
  },
});
