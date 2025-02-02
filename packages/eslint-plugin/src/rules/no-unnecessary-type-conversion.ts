import type { TSESTree } from '@typescript-eslint/utils';
import type {
  ReportDescriptorMessageData,
  RuleFix,
  RuleFixer,
} from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getWrappingFixer,
  isTypeFlagSet,
} from '../util';

type Options = [];
type MessageIds =
  | 'unnecessaryTypeConversion'
  | 'unnecessaryTypeConversionSuggestion';

export default createRule<Options, MessageIds>({
  name: 'no-unnecessary-type-conversion',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow conversion idioms when they do not change the type or value of the expression',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      unnecessaryTypeConversion:
        '{{violation}} does not change the type or value of the {{type}}.',
      unnecessaryTypeConversionSuggestion:
        'Instead, assert that the value satisfies type {{type}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function doesUnderlyingTypeMatchFlag(
      type: ts.Type,
      typeFlag: ts.TypeFlags,
    ): boolean {
      const matchesType = (t: ts.Type): boolean => {
        return isTypeFlagSet(t, typeFlag);
      };

      if (type.isUnion()) {
        return type.types.every(matchesType);
      }

      if (type.isIntersection()) {
        return type.types.some(matchesType);
      }

      return matchesType(type);
    }

    const services = getParserServices(context);

    function handleUnaryOperator(
      node: TSESTree.UnaryExpression,
      typeFlag: ts.TypeFlags,
      reportDescriptorMessageData: ReportDescriptorMessageData,
      isDoubleOperator: boolean, // !! or ~~
    ) {
      const type = services.getTypeAtLocation(node.argument);
      if (doesUnderlyingTypeMatchFlag(type, typeFlag)) {
        const wrappingFixerParams = {
          node: isDoubleOperator ? node.parent : node,
          innerNode: [node.argument],
          sourceCode: context.sourceCode,
        };
        const typeString =
          typeFlag === ts.TypeFlags.BooleanLike ? 'boolean' : 'number';

        context.report({
          loc: {
            start: isDoubleOperator ? node.parent.loc.start : node.loc.start,
            end: {
              column: node.loc.start.column + 1,
              line: node.loc.start.line,
            },
          },
          messageId: 'unnecessaryTypeConversion',
          data: reportDescriptorMessageData,
          fix: getWrappingFixer({
            ...wrappingFixerParams,
            wrap: expr => expr,
          }),
          suggest: [
            {
              messageId: 'unnecessaryTypeConversionSuggestion',
              data: { type: reportDescriptorMessageData.type },
              fix: getWrappingFixer({
                ...wrappingFixerParams,
                wrap: expr => `${expr} satisfies ${typeString}`,
              }),
            },
          ],
        });
      }
    }

    return {
      'AssignmentExpression[operator = "+="]'(
        node: TSESTree.AssignmentExpression,
      ): void {
        if (
          node.right.type === AST_NODE_TYPES.Literal &&
          node.right.value === '' &&
          doesUnderlyingTypeMatchFlag(
            services.getTypeAtLocation(node.left),
            ts.TypeFlags.StringLike,
          )
        ) {
          const wrappingFixerParams = {
            node,
            innerNode: [node.left],
            sourceCode: context.sourceCode,
          };

          context.report({
            node,
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'string',
              violation: "Concatenating a string with ''",
            },
            fix:
              node.parent.type === AST_NODE_TYPES.ExpressionStatement
                ? (fixer: RuleFixer): RuleFix[] => [
                    fixer.removeRange([
                      node.parent.range[0],
                      node.parent.range[1],
                    ]),
                  ]
                : getWrappingFixer({
                    ...wrappingFixerParams,
                    wrap: expr => expr,
                  }),
            suggest: [
              {
                messageId: 'unnecessaryTypeConversionSuggestion',
                data: { type: 'string' },
                fix: getWrappingFixer({
                  ...wrappingFixerParams,
                  wrap: expr => `${expr} satisfies string`,
                }),
              },
            ],
          });
        }
      },
      'BinaryExpression[operator = "+"]'(
        node: TSESTree.BinaryExpression,
      ): void {
        if (
          node.right.type === AST_NODE_TYPES.Literal &&
          node.right.value === '' &&
          doesUnderlyingTypeMatchFlag(
            services.getTypeAtLocation(node.left),
            ts.TypeFlags.StringLike,
          )
        ) {
          const wrappingFixerParams = {
            node,
            innerNode: [node.left],
            sourceCode: context.sourceCode,
          };

          context.report({
            loc: {
              start: node.left.loc.end,
              end: node.loc.end,
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'string',
              violation: "Concatenating a string with ''",
            },
            fix: getWrappingFixer({
              ...wrappingFixerParams,
              wrap: expr => expr,
            }),
            suggest: [
              {
                messageId: 'unnecessaryTypeConversionSuggestion',
                data: { type: 'string' },
                fix: getWrappingFixer({
                  ...wrappingFixerParams,
                  wrap: expr => `${expr} satisfies string`,
                }),
              },
            ],
          });
        } else if (
          node.left.type === AST_NODE_TYPES.Literal &&
          node.left.value === '' &&
          doesUnderlyingTypeMatchFlag(
            services.getTypeAtLocation(node.right),
            ts.TypeFlags.StringLike,
          )
        ) {
          const wrappingFixerParams = {
            node,
            innerNode: [node.right],
            sourceCode: context.sourceCode,
          };

          context.report({
            loc: {
              start: node.loc.start,
              end: node.right.loc.start,
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'string',
              violation: "Concatenating '' with a string",
            },
            fix: getWrappingFixer({
              ...wrappingFixerParams,
              wrap: expr => expr,
            }),
            suggest: [
              {
                messageId: 'unnecessaryTypeConversionSuggestion',
                data: { type: 'string' },
                fix: getWrappingFixer({
                  ...wrappingFixerParams,
                  wrap: expr => `${expr} satisfies string`,
                }),
              },
            ],
          });
        }
      },
      CallExpression(node: TSESTree.CallExpression): void {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.arguments.length === 1
        ) {
          const getType = () =>
            getConstrainedTypeAtLocation(services, node.arguments[0]);

          const isBuiltInCall = (name: string) => {
            if ((node.callee as TSESTree.Identifier).name === name) {
              const scope = context.sourceCode.getScope(node);
              const variable = scope.set.get(name);
              return !variable?.defs.length;
            }
            return false;
          };

          if (
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            (isBuiltInCall('String') &&
              doesUnderlyingTypeMatchFlag(
                getType(),
                ts.TypeFlags.StringLike,
              )) ||
            (isBuiltInCall('Number') &&
              doesUnderlyingTypeMatchFlag(
                getType(),
                ts.TypeFlags.NumberLike,
              )) ||
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            (isBuiltInCall('Boolean') &&
              doesUnderlyingTypeMatchFlag(
                getType(),
                ts.TypeFlags.BooleanLike,
              )) ||
            (isBuiltInCall('BigInt') &&
              doesUnderlyingTypeMatchFlag(getType(), ts.TypeFlags.BigIntLike))
          ) {
            const wrappingFixerParams = {
              node,
              innerNode: [node.arguments[0]],
              sourceCode: context.sourceCode,
            };
            const typeString = node.callee.name.toLowerCase();

            context.report({
              loc: node.callee.loc,
              messageId: 'unnecessaryTypeConversion',
              data: {
                type: node.callee.name.toLowerCase(),
                violation: `Passing a ${typeString} to ${node.callee.name}()`,
              },
              fix: getWrappingFixer({
                ...wrappingFixerParams,
                wrap: expr => expr,
              }),
              suggest: [
                {
                  messageId: 'unnecessaryTypeConversionSuggestion',
                  data: { type: typeString },
                  fix: getWrappingFixer({
                    ...wrappingFixerParams,
                    wrap: expr => `${expr} satisfies ${typeString}`,
                  }),
                },
              ],
            });
          }
        }
      },
      'CallExpression > MemberExpression.callee > Identifier[name = "toString"].property'(
        node: TSESTree.Expression,
      ): void {
        const memberExpr = node.parent as TSESTree.MemberExpression;
        const type = getConstrainedTypeAtLocation(services, memberExpr.object);
        if (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.StringLike)) {
          const wrappingFixerParams = {
            node: memberExpr.parent,
            innerNode: [memberExpr.object],
            sourceCode: context.sourceCode,
          };

          context.report({
            loc: {
              start: memberExpr.property.loc.start,
              end: memberExpr.parent.loc.end,
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'string',
              violation: "Calling a string's .toString() method",
            },
            fix: getWrappingFixer({
              ...wrappingFixerParams,
              wrap: expr => expr,
            }),
            suggest: [
              {
                messageId: 'unnecessaryTypeConversionSuggestion',
                data: { type: 'string' },
                fix: getWrappingFixer({
                  ...wrappingFixerParams,
                  wrap: expr => `${expr} satisfies string`,
                }),
              },
            ],
          });
        }
      },
      'UnaryExpression[operator = "!"] > UnaryExpression[operator = "!"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        handleUnaryOperator(
          node,
          ts.TypeFlags.BooleanLike,
          {
            type: 'boolean',
            violation: 'Using !! on a boolean',
          },
          true,
        );
      },
      'UnaryExpression[operator = "+"]'(node: TSESTree.UnaryExpression): void {
        handleUnaryOperator(
          node,
          ts.TypeFlags.NumberLike,
          {
            type: 'number',
            violation: 'Using the unary + operator on a number',
          },
          false,
        );
      },
      'UnaryExpression[operator = "~"] > UnaryExpression[operator = "~"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        handleUnaryOperator(
          node,
          ts.TypeFlags.NumberLike,
          {
            type: 'boolean',
            violation: 'Using ~~ on a number',
          },
          true,
        );
      },
    };
  },
});
