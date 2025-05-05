import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { RuleFix } from '@typescript-eslint/utils/ts-eslint';
import type { Type } from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getStaticValue,
  isStaticMemberAccessOfValue,
  nullThrows,
  skipChainExpression,
} from '../util';

export default createRule({
  name: 'prefer-find',
  meta: {
    type: 'suggestion',
    docs: {
      recommended: 'stylistic',
      description:
        'Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      preferFind: 'Prefer .find(...) instead of .filter(...)[0].',
      preferFindSuggestion: 'Use .find(...) instead of .filter(...)[0].',
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    const globalScope = context.sourceCode.getScope(context.sourceCode.ast);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    interface FilterExpressionData {
      filterNode: TSESTree.Node;
      isBracketSyntaxForFilter: boolean;
    }

    function parseArrayFilterExpressions(
      expression: TSESTree.Expression,
    ): FilterExpressionData[] {
      const node = skipChainExpression(expression);

      if (node.type === AST_NODE_TYPES.SequenceExpression) {
        // Only the last expression in (a, b, [1, 2, 3].filter(condition))[0] matters
        const lastExpression = nullThrows(
          node.expressions.at(-1),
          'Expected to have more than zero expressions in a sequence expression',
        );
        return parseArrayFilterExpressions(lastExpression);
      }

      // This is the only reason we're returning a list rather than a single value.
      if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        // Both branches of the ternary _must_ return results.
        const consequentResult = parseArrayFilterExpressions(node.consequent);
        if (consequentResult.length === 0) {
          return [];
        }

        const alternateResult = parseArrayFilterExpressions(node.alternate);
        if (alternateResult.length === 0) {
          return [];
        }

        // Accumulate the results from both sides and pass up the chain.
        return [...consequentResult, ...alternateResult];
      }

      // Check if it looks like <<stuff>>(...), but not <<stuff>>?.(...)
      if (node.type === AST_NODE_TYPES.CallExpression && !node.optional) {
        const callee = node.callee;
        // Check if it looks like <<stuff>>.filter(...) or <<stuff>>['filter'](...),
        // or the optional chaining variants.
        if (callee.type === AST_NODE_TYPES.MemberExpression) {
          const isBracketSyntaxForFilter = callee.computed;
          if (isStaticMemberAccessOfValue(callee, context, 'filter')) {
            const filterNode = callee.property;

            const filteredObjectType = getConstrainedTypeAtLocation(
              services,
              callee.object,
            );

            // As long as the object is a (possibly nullable) array,
            // this is an Array.prototype.filter expression.
            if (isArrayish(filteredObjectType)) {
              return [
                {
                  filterNode,
                  isBracketSyntaxForFilter,
                },
              ];
            }
          }
        }
      }

      // not a filter expression.
      return [];
    }

    /**
     * Tells whether the type is a possibly nullable array/tuple or union thereof.
     */
    function isArrayish(type: Type): boolean {
      let isAtLeastOneArrayishComponent = false;
      for (const unionPart of tsutils.unionConstituents(type)) {
        if (
          tsutils.isIntrinsicNullType(unionPart) ||
          tsutils.isIntrinsicUndefinedType(unionPart)
        ) {
          continue;
        }

        // apparently checker.isArrayType(T[] & S[]) => false.
        // so we need to check the intersection parts individually.
        const isArrayOrIntersectionThereof = tsutils
          .intersectionConstituents(unionPart)
          .every(
            intersectionPart =>
              checker.isArrayType(intersectionPart) ||
              checker.isTupleType(intersectionPart),
          );

        if (!isArrayOrIntersectionThereof) {
          // There is a non-array, non-nullish type component,
          // so it's not an array.
          return false;
        }

        isAtLeastOneArrayishComponent = true;
      }

      return isAtLeastOneArrayishComponent;
    }

    function getObjectIfArrayAtZeroExpression(
      node: TSESTree.CallExpression,
    ): TSESTree.Expression | undefined {
      // .at() should take exactly one argument.
      if (node.arguments.length !== 1) {
        return undefined;
      }

      const callee = node.callee;
      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.optional &&
        isStaticMemberAccessOfValue(callee, context, 'at')
      ) {
        const atArgument = getStaticValue(node.arguments[0], globalScope);
        if (atArgument != null && isTreatedAsZeroByArrayAt(atArgument.value)) {
          return callee.object;
        }
      }

      return undefined;
    }

    /**
     * Implements the algorithm for array indexing by `.at()` method.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at#parameters
     */
    function isTreatedAsZeroByArrayAt(value: unknown): boolean {
      // This would cause the number constructor coercion to throw. Other static
      // values are safe.
      if (typeof value === 'symbol') {
        return false;
      }

      const asNumber = Number(value);

      if (isNaN(asNumber)) {
        return true;
      }

      return Math.trunc(asNumber) === 0;
    }

    function isMemberAccessOfZero(
      node: TSESTree.MemberExpressionComputedName,
    ): boolean {
      const property = getStaticValue(node.property, globalScope);
      // Check if it looks like <<stuff>>[0] or <<stuff>>['0'], but not <<stuff>>?.[0]
      return (
        !node.optional &&
        property != null &&
        isTreatedAsZeroByMemberAccess(property.value)
      );
    }

    /**
     * Implements the algorithm for array indexing by member operator.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#array_indices
     */
    function isTreatedAsZeroByMemberAccess(value: unknown): boolean {
      return String(value) === '0';
    }

    function generateFixToRemoveArrayElementAccess(
      fixer: TSESLint.RuleFixer,
      arrayNode: TSESTree.Expression,
      wholeExpressionBeingFlagged: TSESTree.Expression,
    ): RuleFix {
      const tokenToStartDeletingFrom = nullThrows(
        // The next `.` or `[` is what we're looking for.
        // think of (...).at(0) or (...)[0] or even (...)["at"](0).
        context.sourceCode.getTokenAfter(
          arrayNode,
          token => token.value === '.' || token.value === '[',
        ),
        'Expected to find a member access token!',
      );
      return fixer.removeRange([
        tokenToStartDeletingFrom.range[0],
        wholeExpressionBeingFlagged.range[1],
      ]);
    }

    function generateFixToReplaceFilterWithFind(
      fixer: TSESLint.RuleFixer,
      filterExpression: FilterExpressionData,
    ): TSESLint.RuleFix {
      return fixer.replaceText(
        filterExpression.filterNode,
        filterExpression.isBracketSyntaxForFilter ? '"find"' : 'find',
      );
    }

    return {
      // This query will be used to find things like `filteredResults.at(0)`.
      CallExpression(node): void {
        const object = getObjectIfArrayAtZeroExpression(node);
        if (object) {
          const filterExpressions = parseArrayFilterExpressions(object);
          if (filterExpressions.length !== 0) {
            context.report({
              node,
              messageId: 'preferFind',
              suggest: [
                {
                  messageId: 'preferFindSuggestion',
                  fix: (fixer): TSESLint.RuleFix[] => {
                    return [
                      ...filterExpressions.map(filterExpression =>
                        generateFixToReplaceFilterWithFind(
                          fixer,
                          filterExpression,
                        ),
                      ),
                      // Get rid of the .at(0) or ['at'](0).
                      generateFixToRemoveArrayElementAccess(
                        fixer,
                        object,
                        node,
                      ),
                    ];
                  },
                },
              ],
            });
          }
        }
      },

      // This query will be used to find things like `filteredResults[0]`.
      //
      // Note: we're always looking for array member access to be "computed",
      // i.e. `filteredResults[0]`, since `filteredResults.0` isn't a thing.
      'MemberExpression[computed=true]'(
        node: TSESTree.MemberExpressionComputedName,
      ): void {
        if (isMemberAccessOfZero(node)) {
          const object = node.object;
          const filterExpressions = parseArrayFilterExpressions(object);
          if (filterExpressions.length !== 0) {
            context.report({
              node,
              messageId: 'preferFind',
              suggest: [
                {
                  messageId: 'preferFindSuggestion',
                  fix: (fixer): TSESLint.RuleFix[] => {
                    return [
                      ...filterExpressions.map(filterExpression =>
                        generateFixToReplaceFilterWithFind(
                          fixer,
                          filterExpression,
                        ),
                      ),
                      // Get rid of the [0].
                      generateFixToRemoveArrayElementAccess(
                        fixer,
                        object,
                        node,
                      ),
                    ];
                  },
                },
              ],
            });
          }
        }
      },
    };
  },
});
