import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

type MessageIds =
  | 'direct'
  | 'negated'
  | 'comparingNullableToTrueDirect'
  | 'comparingNullableToTrueNegated'
  | 'comparingNullableToFalse';

type Options = [
  {
    allowComparingNullableBooleansToTrue?: boolean;
    allowComparingNullableBooleansToFalse?: boolean;
  },
];

interface BooleanComparison {
  expression: TSESTree.Expression;
  literalBooleanInComparison: boolean;
  forTruthy: boolean;
  negated: boolean;
  range: [number, number];
}

interface BooleanComparisonWithTypeInformation extends BooleanComparison {
  expressionIsNullableBoolean: boolean;
}

export default util.createRule<Options, MessageIds>({
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
      comparingNullableToTrueDirect:
        'This expression unnecessarily compares a nullable boolean value to true instead of using it directly.',
      comparingNullableToTrueNegated:
        'This expression unnecessarily compares a nullable boolean value to true instead of negating it.',
      comparingNullableToFalse:
        'This expression unnecessarily compares a nullable boolean value to false instead of using the ?? operator to provide a default.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowComparingNullableBooleansToTrue: {
            type: 'boolean',
          },
          allowComparingNullableBooleansToFalse: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    {
      allowComparingNullableBooleansToTrue: true,
      allowComparingNullableBooleansToFalse: true,
    },
  ],
  create(context, [options]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function getBooleanComparison(
      node: TSESTree.BinaryExpression,
    ): BooleanComparisonWithTypeInformation | undefined {
      const comparison = deconstructComparison(node);
      if (!comparison) {
        return undefined;
      }

      const expressionType = checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(comparison.expression),
      );

      if (isBooleanType(expressionType)) {
        return {
          ...comparison,
          expressionIsNullableBoolean: false,
        };
      }

      if (isNullableBoolean(expressionType)) {
        return {
          ...comparison,
          expressionIsNullableBoolean: true,
        };
      }

      return undefined;
    }

    function isBooleanType(expressionType: ts.Type): boolean {
      return tsutils.isTypeFlagSet(
        expressionType,
        ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral,
      );
    }

    /**
     * checks if the expressionType is a union that
     *   1) contains at least one nullish type (null or undefined)
     *   2) contains at least once boolean type (true or false or boolean)
     *   3) does not contain any types besides nullish and boolean types
     */
    function isNullableBoolean(expressionType: ts.Type): boolean {
      if (!expressionType.isUnion()) {
        return false;
      }

      const { types } = expressionType;

      const nonNullishTypes = types.filter(
        type =>
          !tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.Undefined | ts.TypeFlags.Null,
          ),
      );

      const hasNonNullishType = nonNullishTypes.length > 0;
      if (!hasNonNullishType) {
        return false;
      }

      const hasNullableType = nonNullishTypes.length < types.length;
      if (!hasNullableType) {
        return false;
      }

      const allNonNullishTypesAreBoolean = nonNullishTypes.every(isBooleanType);
      if (!allNonNullishTypesAreBoolean) {
        return false;
      }

      return true;
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

        const { value: literalBooleanInComparison } = against;
        const negated = !comparisonType.isPositive;

        return {
          literalBooleanInComparison,
          forTruthy: literalBooleanInComparison ? !negated : negated,
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

    function nodeIsUnaryNegation(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.prefix &&
        node.operator === '!'
      );
    }

    return {
      BinaryExpression(node): void {
        const comparison = getBooleanComparison(node);
        if (comparison === undefined) {
          return;
        }

        if (comparison.expressionIsNullableBoolean) {
          if (
            comparison.literalBooleanInComparison &&
            options.allowComparingNullableBooleansToTrue
          ) {
            return;
          }
          if (
            !comparison.literalBooleanInComparison &&
            options.allowComparingNullableBooleansToFalse
          ) {
            return;
          }
        }

        context.report({
          fix: function* (fixer) {
            yield fixer.removeRange(comparison.range);

            // if the expression `exp` isn't nullable, or we're comparing to `true`,
            // we can just replace the entire comparison with `exp` or `!exp`
            if (
              !comparison.expressionIsNullableBoolean ||
              comparison.literalBooleanInComparison
            ) {
              if (!comparison.forTruthy) {
                yield fixer.insertTextBefore(node, '!');
              }
              return;
            }

            // if we're here, then the expression is a nullable boolean and we're
            // comparing to a literal `false`

            // if we're doing `== false` or `=== false`, then we need to negate the expression
            if (!comparison.negated) {
              const { parent } = node;
              // if the parent is a negation, we can instead just get rid of the parent's negation.
              // i.e. instead of resulting in `!(!(exp))`, we can just result in `exp`
              if (parent != null && nodeIsUnaryNegation(parent)) {
                // remove from the beginning of the parent to the beginning of this node
                yield fixer.removeRange([parent.range[0], node.range[0]]);
                // remove from the end of the node to the end of the parent
                yield fixer.removeRange([node.range[1], parent.range[1]]);
              } else {
                yield fixer.insertTextBefore(node, '!');
              }
            }

            // provide the default `true`
            yield fixer.insertTextBefore(node, '(');
            yield fixer.insertTextAfter(node, ' ?? true)');
          },
          messageId: comparison.expressionIsNullableBoolean
            ? comparison.literalBooleanInComparison
              ? comparison.negated
                ? 'comparingNullableToTrueNegated'
                : 'comparingNullableToTrueDirect'
              : 'comparingNullableToFalse'
            : comparison.negated
            ? 'negated'
            : 'direct',
          node,
        });
      },
    };
  },
});
