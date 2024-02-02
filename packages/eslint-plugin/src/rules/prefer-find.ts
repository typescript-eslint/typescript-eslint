import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'prefer-find',
  meta: {
    docs: {
      description:
        'Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result',
      requiresTypeChecking: true,
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      preferFind: 'Use .filter(...)[0] instead of .find(...)',
      preferFindFix: 'Use .filter(...)[0] instead of .find(...)',
    },
    schema: [],
    type: 'suggestion',
    hasSuggestions: true,
  },

  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      MemberExpression(node): void {
        // Check if it looks like <<stuff>>[0] or <<stuff>>['0'], but not <<stuff>>?.[0]
        if (
          node.computed &&
          !node.optional &&
          node.property.type === AST_NODE_TYPES.Literal &&
          (node.property.value === 0 ||
            node.property.value === '0' ||
            node.property.value === 0n)
        ) {
          // Check if it looks like <<stuff>>(...)[0], but not <<stuff>>?.(...)[0]
          if (
            node.object.type === AST_NODE_TYPES.CallExpression &&
            !node.object.optional
          ) {
            const objectCallee = node.object.callee;
            // Check if it looks like <<stuff>>.filter(...)[0] or <<stuff>>['filter'](...)[0],
            // or the optional chaining variants.
            if (objectCallee.type === AST_NODE_TYPES.MemberExpression) {
              const isBracketSyntaxForFilter = objectCallee.computed;
              if (
                isBracketSyntaxForFilter
                  ? objectCallee.property.type === AST_NODE_TYPES.Literal &&
                    objectCallee.property.value === 'filter'
                  : objectCallee.property.name === 'filter'
              ) {
                const isOptionalAccessOfFilter = objectCallee.optional;

                const filteredObjectType = checker.getTypeAtLocation(
                  services.esTreeNodeToTSNodeMap.get(objectCallee.object),
                );

                // We can now report if the object is an array
                // or if it's an optional chain on a nullable array.
                if (
                  checker.isArrayType(filteredObjectType) ||
                  (isOptionalAccessOfFilter &&
                    tsutils
                      .unionTypeParts(filteredObjectType)
                      .every(
                        unionPart =>
                          checker.isArrayType(unionPart) ||
                          tsutils.isIntrinsicNullType(unionPart) ||
                          tsutils.isIntrinsicUndefinedType(unionPart),
                      ))
                ) {
                  context.report({
                    node,
                    messageId: 'preferFind',
                    suggest: [
                      {
                        messageId: 'preferFindFix',
                        fix(fixer): TSESLint.RuleFix[] {
                          return [
                            // Replace .filter with .find
                            fixer.replaceText(
                              objectCallee.property,
                              isBracketSyntaxForFilter ? '"find"' : 'find',
                            ),
                            // Get rid of the [0]
                            fixer.removeRange([
                              node.object.range[1],
                              node.range[1],
                            ]),
                          ];
                        },
                      },
                    ],
                  });
                }
              }
            }
          }
        }
      },
    };
  },
});
