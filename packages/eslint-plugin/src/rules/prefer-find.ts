import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { getScope, getSourceCode } from '@typescript-eslint/utils/eslint-utils';
import type { RuleFix, SourceCode } from '@typescript-eslint/utils/ts-eslint';
import * as tsutils from 'ts-api-utils';
import type { Type } from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getStaticValue,
  nullThrows,
} from '../util';

export default createRule({
  name: 'prefer-find',
  meta: {
    docs: {
      description:
        'Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result',
      requiresTypeChecking: true,
    },
    messages: {
      preferFind: 'Use .find(...) instead of .filter(...)[0]',
      preferFindSuggestion: 'Use .find(...) instead of .filter(...)[0]',
    },
    schema: [],
    type: 'suggestion',
    hasSuggestions: true,
  },

  defaultOptions: [],

  create(context) {
    const globalScope = getScope(context);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function parseIfArrayFilterExpression(
      expression: TSESTree.Expression,
    ):
      | { isBracketSyntaxForFilter: boolean; filterNode: TSESTree.Node }
      | undefined {
      if (expression.type === AST_NODE_TYPES.SequenceExpression) {
        // Only the last expression in the (a, b, [1, 2, 3].filter(condition))[0] matters
        const lastExpression = nullThrows(
          expression.expressions.at(-1),
          'Expected to have more than zero expressions in a sequence expression',
        );
        return parseIfArrayFilterExpression(lastExpression);
      }

      if (expression.type === AST_NODE_TYPES.ChainExpression) {
        return parseIfArrayFilterExpression(expression.expression);
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
          if (
            isBracketSyntaxForFilter
              ? getStaticValue(callee.property, globalScope)?.value === 'filter'
              : callee.property.name === 'filter'
          ) {
            const filterNode = callee.property;

            const filteredObjectType = getConstrainedTypeAtLocation(
              services,
              callee.object,
            );

            // As long as the object is an array or an optional chain on a
            // nullable array, this is an Array.prototype.filter expression.
            if (isArrayish(filteredObjectType)) {
              return {
                isBracketSyntaxForFilter,
                filterNode,
              };
            }
          }
        }
      }

      return undefined;
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
          // ignore
        } else if (
          checker.isArrayType(unionPart) ||
          checker.isTupleType(unionPart)
        ) {
          isAtLeastOneArrayishComponent = true;
        } else {
          return false;
        }
      }

      return isAtLeastOneArrayishComponent;
    }

    function getObjectIfArrayAtExpression(
      node: TSESTree.CallExpression,
    ): TSESTree.Expression | undefined {
      if (node.arguments.length === 1) {
        const atArgument = getStaticValue(node.arguments[0], globalScope);
        if (atArgument != null && isTreatedAsZeroByArrayAt(atArgument.value)) {
          const callee = node.callee;
          if (
            callee.type === AST_NODE_TYPES.MemberExpression &&
            !callee.optional &&
            (callee.computed
              ? getStaticValue(callee.property, globalScope)?.value === 'at'
              : callee.property.name === 'at')
          ) {
            return callee.object;
          }
        }
      }

      return undefined;
    }

    /**
     * Implements the algorithm for array indexing by `.at()` method.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at#parameters
     */
    function isTreatedAsZeroByArrayAt(value: unknown): boolean {
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
      sourceCode: SourceCode,
    ): RuleFix {
      const tokenToStartDeletingFrom = nullThrows(
        // The next `.` or `[` is what we're looking for.
        // think of (...).at(0) or (...)[0] or even (...)["at"](0).
        sourceCode.getTokenAfter(
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
      filterExpression: {
        isBracketSyntaxForFilter: boolean;
        filterNode: TSESTree.Node;
      },
    ): TSESLint.RuleFix {
      return fixer.replaceText(
        filterExpression.filterNode,
        filterExpression.isBracketSyntaxForFilter ? '"find"' : 'find',
      );
    }

    return {
      CallExpression(node): void {
        const object = getObjectIfArrayAtExpression(node);
        if (object) {
          const filterExpression = parseIfArrayFilterExpression(object);
          if (filterExpression) {
            context.report({
              node,
              messageId: 'preferFind',
              suggest: [
                {
                  messageId: 'preferFindSuggestion',
                  fix(fixer): TSESLint.RuleFix[] {
                    const sourceCode = getSourceCode(context);
                    return [
                      generateFixToReplaceFilterWithFind(
                        fixer,
                        filterExpression,
                      ),
                      // get rid of the .at(0) or ['at'](0)
                      generateFixToRemoveArrayElementAccess(
                        fixer,
                        object,
                        node,
                        sourceCode,
                      ),
                    ];
                  },
                },
              ],
            });
          }
        }
      },

      // we're always looking for array member access to be "computed",
      // i.e. filteredResults[0], since filteredResults.0 isn't a thing.
      ['MemberExpression[computed=true]'](
        node: TSESTree.MemberExpressionComputedName,
      ): void {
        if (isMemberAccessOfZero(node)) {
          const object = node.object;
          const filterExpression = parseIfArrayFilterExpression(object);
          if (filterExpression) {
            context.report({
              node,
              messageId: 'preferFind',
              suggest: [
                {
                  messageId: 'preferFindSuggestion',
                  fix(fixer): TSESLint.RuleFix[] {
                    const sourceCode = context.sourceCode;

                    return [
                      generateFixToReplaceFilterWithFind(
                        fixer,
                        filterExpression,
                      ),
                      // Get rid of the [0]
                      generateFixToRemoveArrayElementAccess(
                        fixer,
                        object,
                        node,
                        sourceCode,
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
