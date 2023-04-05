import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
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
  expression: TSESTree.Expression | TSESTree.PrivateIdentifier;
  literalBooleanInComparison: boolean;
  negated: boolean;
}

interface BooleanComparisonWithTypeInformation extends BooleanComparison {
  expressionIsNullableBoolean: boolean;
}

export default util.createRule<Options, MessageIds>({
  name: 'no-unnecessary-boolean-literal-compare',
  meta: {
    docs: {
      description:
        'Disallow unnecessary equality comparisons against boolean literals',
      recommended: 'strict',
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
            description:
              'Whether to allow comparisons between nullable boolean variables and `true`.',
            type: 'boolean',
          },
          allowComparingNullableBooleansToFalse: {
            description:
              'Whether to allow comparisons between nullable boolean variables and `false`.',
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
    const services = util.getParserServices(context);
    const sourceCode = context.getSourceCode();

    function getBooleanComparison(
      node: TSESTree.BinaryExpression,
    ): BooleanComparisonWithTypeInformation | undefined {
      const comparison = deconstructComparison(node);
      if (!comparison) {
        return undefined;
      }

      const expressionType = services.getTypeAtLocation(comparison.expression);

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
      const comparisonType = getEqualsKind(node.operator);
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
          expression,
          negated,
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
            // 1. isUnaryNegation - parent negation
            // 2. literalBooleanInComparison - is compared to literal boolean
            // 3. negated - is expression negated

            const isUnaryNegation =
              node.parent != null && nodeIsUnaryNegation(node.parent);

            const shouldNegate =
              comparison.negated !== comparison.literalBooleanInComparison;

            const mutatedNode = isUnaryNegation ? node.parent : node;

            yield fixer.replaceText(
              mutatedNode,
              sourceCode.getText(comparison.expression),
            );

            // if `isUnaryNegation === literalBooleanInComparison === !negated` is true - negate the expression
            if (shouldNegate === isUnaryNegation) {
              yield fixer.insertTextBefore(mutatedNode, '!');

              // if the expression `exp` is not a strong precedence node, wrap it in parentheses
              if (!util.isStrongPrecedenceNode(comparison.expression)) {
                yield fixer.insertTextBefore(mutatedNode, '(');
                yield fixer.insertTextAfter(mutatedNode, ')');
              }
            }

            // if the expression `exp` is nullable, and we're not comparing to `true`, insert `?? true`
            if (
              comparison.expressionIsNullableBoolean &&
              !comparison.literalBooleanInComparison
            ) {
              // provide the default `true`
              yield fixer.insertTextBefore(mutatedNode, '(');
              yield fixer.insertTextAfter(mutatedNode, ' ?? true)');
            }
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

interface EqualsKind {
  isPositive: boolean;
  isStrict: boolean;
}

function getEqualsKind(operator: string): EqualsKind | undefined {
  switch (operator) {
    case '==':
      return {
        isPositive: true,
        isStrict: false,
      };

    case '===':
      return {
        isPositive: true,
        isStrict: true,
      };

    case '!=':
      return {
        isPositive: false,
        isStrict: false,
      };

    case '!==':
      return {
        isPositive: false,
        isStrict: true,
      };

    default:
      return undefined;
  }
}
