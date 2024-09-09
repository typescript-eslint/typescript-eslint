import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { RuleFix, Scope } from '@typescript-eslint/utils/ts-eslint';
import type { Type } from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getStaticValue,
  nullThrows,
} from '../util';

export default createRule({
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
      if (expression.type === AST_NODE_TYPES.SequenceExpression) {
        // Only the last expression in (a, b, [1, 2, 3].filter(condition))[0] matters
        const lastExpression = nullThrows(
          expression.expressions.at(-1),
          'Expected to have more than zero expressions in a sequence expression',
        );
        return parseArrayFilterExpressions(lastExpression);
      }

      if (expression.type === AST_NODE_TYPES.ChainExpression) {
        return parseArrayFilterExpressions(expression.expression);
      }

      // This is the only reason we're returning a list rather than a single value.
      if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
        // Both branches of the ternary _must_ return results.
        const consequentResult = parseArrayFilterExpressions(
          expression.consequent,
        );
        if (consequentResult.length === 0) {
          return [];
        }

        const alternateResult = parseArrayFilterExpressions(
          expression.alternate,
        );
        if (alternateResult.length === 0) {
          return [];
        }

        // Accumulate the results from both sides and pass up the chain.
        return [...consequentResult, ...alternateResult];
      }

      // Check if it looks like <<stuff>>(...), but not <<stuff>>?.(...)
      if (
        expression.type === AST_NODE_TYPES.CallExpression &&
        !expression.optional
      ) {
        const callee = expression.callee;
        // Check if it looks like <<stuff>>.filter(...) or <<stuff>>['filter'](...),
        // or the optional chaining variants.
        if (callee.type === AST_NODE_TYPES.MemberExpression) {
          const isBracketSyntaxForFilter = callee.computed;
          if (isStaticMemberAccessOfValue(callee, 'filter', globalScope)) {
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
      for (const unionPart of tsutils.unionTypeParts(type)) {
        if (
          tsutils.isIntrinsicNullType(unionPart) ||
          tsutils.isIntrinsicUndefinedType(unionPart)
        ) {
          continue;
        }

        // apparently checker.isArrayType(T[] & S[]) => false.
        // so we need to check the intersection parts individually.
        const isArrayOrIntersectionThereof = tsutils
          .intersectionTypeParts(unionPart)
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
        isStaticMemberAccessOfValue(callee, 'at', globalScope)
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
              messageId: 'preferFind',
              node,
              suggest: [
                {
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
                  messageId: 'preferFindSuggestion',
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
              messageId: 'preferFind',
              node,
              suggest: [
                {
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
                  messageId: 'preferFindSuggestion',
                },
              ],
            });
          }
        }
      },
    };
  },
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      preferFind: 'Prefer .find(...) instead of .filter(...)[0].',
      preferFindSuggestion: 'Use .find(...) instead of .filter(...)[0].',
    },
    schema: [],
  },
  name: 'prefer-find',
});

/**
 * Answers whether the member expression looks like
 * `x.memberName`, `x['memberName']`,
 * or even `const mn = 'memberName'; x[mn]` (or optional variants thereof).
 */
function isStaticMemberAccessOfValue(
  memberExpression:
    | TSESTree.MemberExpressionComputedName
    | TSESTree.MemberExpressionNonComputedName,
  value: string,
  scope?: Scope.Scope | undefined,
): boolean {
  if (!memberExpression.computed) {
    // x.memberName case.
    return memberExpression.property.name === value;
  }

  // x['memberName'] cases.
  const staticValueResult = getStaticValue(memberExpression.property, scope);
  return staticValueResult != null && value === staticValueResult.value;
}
