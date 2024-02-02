import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { getScope, getSourceCode } from '@typescript-eslint/utils/eslint-utils';
import type { RuleFix, SourceCode } from '@typescript-eslint/utils/ts-eslint';
import * as tsutils from 'ts-api-utils';

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
      preferFind: 'Use .filter(...)[0] instead of .find(...)',
      preferFindSuggestion: 'Use .filter(...)[0] instead of .find(...)',
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
            const isOptionalAccessOfFilter = callee.optional;

            const filteredObjectType = getConstrainedTypeAtLocation(
              services,
              callee.object,
            );

            // As long as the object is an array or an optional chain on a
            // nullable array, this is an Array.prototype.filter expression.
            if (
              checker.isArrayType(filteredObjectType) ||
              checker.isTupleType(filteredObjectType) ||
              (isOptionalAccessOfFilter &&
                tsutils
                  .unionTypeParts(filteredObjectType)
                  .every(
                    unionPart =>
                      checker.isArrayType(unionPart) ||
                      checker.isTupleType(unionPart) ||
                      tsutils.isIntrinsicNullType(unionPart) ||
                      tsutils.isIntrinsicUndefinedType(unionPart),
                  ))
            ) {
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
        sourceCode.getTokenAfter(arrayNode, {
          // The next `.` or `[` is what we're looking for.
          // think of (...).at(0) or (...)[0] or even (...)["at"](0).
          filter: token => token.value === '.' || token.value === '[',
        }),
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
