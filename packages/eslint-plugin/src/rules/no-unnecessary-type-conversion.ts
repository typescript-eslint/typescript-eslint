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

    function doesTypeRequireParentheses(type: AST_NODE_TYPES) {
      return ![
        AST_NODE_TYPES.Literal,
        AST_NODE_TYPES.Identifier,
        AST_NODE_TYPES.UnaryExpression,
        AST_NODE_TYPES.CallExpression,
        AST_NODE_TYPES.MemberExpression,
      ].includes(type);
    }

    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    const ruleFixFilter = (ruleFix: boolean | RuleFix) =>
      typeof ruleFix !== 'boolean';

    function handleUnaryOperator(
      node: TSESTree.UnaryExpression,
      typeFlag: ts.TypeFlags,
      reportDescriptorMessageData: ReportDescriptorMessageData,
      isDoubleOperator: boolean, // !! or ~~
    ) {
      const type = services.getTypeAtLocation(node.argument);
      if (doesUnderlyingTypeMatchFlag(type, typeFlag)) {
        const keepParens = doesTypeRequireParentheses(node.argument.type);
        const fixFunction = (fixer: RuleFixer): RuleFix[] =>
          [
            keepParens && fixer.insertTextBeforeRange(node.argument.range, '('),
            fixer.removeRange([
              isDoubleOperator ? node.parent.range[0] : node.range[0],
              node.argument.range[0],
            ]),
            fixer.removeRange([node.argument.range[1], node.range[1]]),
            keepParens && fixer.insertTextAfterRange(node.argument.range, ')'),
          ].filter(ruleFixFilter);
        const typeString = checker.typeToString(type);

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
          fix: fixFunction,
          suggest:
            node.argument.type === AST_NODE_TYPES.Identifier
              ? [
                  {
                    messageId: 'unnecessaryTypeConversionSuggestion',
                    data: { type: reportDescriptorMessageData.type },
                    fix(fixer): RuleFix[] {
                      return [
                        ...fixFunction(fixer),
                        fixer.insertTextAfterRange(
                          node.argument.range,
                          ` satisfies ${typeString}`,
                        ),
                      ];
                    },
                  },
                ]
              : null,
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
          const fixFunction = (fixer: RuleFixer): RuleFix[] => [
            fixer.removeRange([node.left.range[1], node.range[1]]),
          ];

          context.report({
            node,
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'string',
              violation: "Concatenating a string with ''",
            },
            fix: fixFunction,
            suggest:
              node.left.type === AST_NODE_TYPES.Identifier
                ? [
                    {
                      messageId: 'unnecessaryTypeConversionSuggestion',
                      data: { type: 'string' },
                      fix: fixer => [
                        ...fixFunction(fixer),
                        fixer.insertTextAfterRange(
                          node.range,
                          ' satisfies string',
                        ),
                      ],
                    },
                  ]
                : null,
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
          const fixFunction = (fixer: RuleFixer): RuleFix[] => [
            fixer.removeRange([node.range[0], node.left.range[0]]),
            fixer.removeRange([node.left.range[1], node.range[1]]),
          ];

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
            fix: fixFunction,
            suggest:
              node.left.type === AST_NODE_TYPES.Identifier
                ? [
                    {
                      messageId: 'unnecessaryTypeConversionSuggestion',
                      data: { type: 'string' },
                      fix: fixer => [
                        ...fixFunction(fixer),
                        fixer.insertTextAfterRange(
                          node.range,
                          ' satisfies string',
                        ),
                      ],
                    },
                  ]
                : null,
          });
        } else if (
          node.left.type === AST_NODE_TYPES.Literal &&
          node.left.value === '' &&
          doesUnderlyingTypeMatchFlag(
            services.getTypeAtLocation(node.right),
            ts.TypeFlags.StringLike,
          )
        ) {
          const fixFunction = (fixer: RuleFixer): RuleFix[] => [
            fixer.removeRange([node.range[0], node.right.range[0]]),
            fixer.removeRange([node.right.range[1], node.range[1]]),
          ];

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
            fix: fixFunction,
            suggest:
              node.right.type === AST_NODE_TYPES.Identifier
                ? [
                    {
                      messageId: 'unnecessaryTypeConversionSuggestion',
                      data: { type: 'string' },
                      fix: fixer => [
                        ...fixFunction(fixer),
                        fixer.insertTextAfterRange(
                          node.range,
                          ' satisfies string',
                        ),
                      ],
                    },
                  ]
                : null,
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

          if (
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            (node.callee.name === 'String' &&
              doesUnderlyingTypeMatchFlag(
                getType(),
                ts.TypeFlags.StringLike,
              )) ||
            (node.callee.name === 'Number' &&
              doesUnderlyingTypeMatchFlag(
                getType(),
                ts.TypeFlags.NumberLike,
              )) ||
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            (node.callee.name === 'Boolean' &&
              doesUnderlyingTypeMatchFlag(
                getType(),
                ts.TypeFlags.BooleanLike,
              )) ||
            (node.callee.name === 'BigInt' &&
              doesUnderlyingTypeMatchFlag(getType(), ts.TypeFlags.BigIntLike))
          ) {
            const keepParens = doesTypeRequireParentheses(
              node.arguments[0].type,
            );
            const fixFunction = (fixer: RuleFixer): RuleFix[] =>
              [
                keepParens &&
                  fixer.insertTextBeforeRange(node.arguments[0].range, '('),
                fixer.removeRange([node.range[0], node.arguments[0].range[0]]),
                fixer.removeRange([node.arguments[0].range[1], node.range[1]]),
                keepParens &&
                  fixer.insertTextAfterRange(node.arguments[0].range, ')'),
              ].filter(ruleFixFilter);
            const typeString = node.callee.name.toLowerCase();

            context.report({
              loc: node.callee.loc,
              messageId: 'unnecessaryTypeConversion',
              data: {
                type: node.callee.name.toLowerCase(),
                violation: `Passing a ${typeString} to ${node.callee.name}()`,
              },
              fix: fixFunction,
              suggest:
                node.arguments[0].type === AST_NODE_TYPES.Identifier
                  ? [
                      {
                        messageId: 'unnecessaryTypeConversionSuggestion',
                        data: { type: typeString },
                        fix: fixer => [
                          ...fixFunction(fixer),
                          fixer.insertTextAfterRange(
                            node.range,
                            ` satisfies ${typeString}`,
                          ),
                        ],
                      },
                    ]
                  : null,
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
          const keepParens = doesTypeRequireParentheses(memberExpr.object.type);
          const fixFunction = (fixer: RuleFixer): RuleFix[] =>
            [
              keepParens &&
                fixer.insertTextBeforeRange(memberExpr.object.range, '('),
              fixer.removeRange([
                memberExpr.parent.range[0],
                memberExpr.object.range[0],
              ]),
              fixer.removeRange([
                memberExpr.object.range[1],
                memberExpr.parent.range[1],
              ]),
              keepParens &&
                fixer.insertTextAfterRange(memberExpr.object.range, ')'),
            ].filter(ruleFixFilter);

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
            fix: fixFunction,
            suggest:
              memberExpr.object.type === AST_NODE_TYPES.Identifier
                ? [
                    {
                      messageId: 'unnecessaryTypeConversionSuggestion',
                      data: { type: 'string' },
                      fix: fixer => [
                        ...fixFunction(fixer),
                        fixer.insertTextAfterRange(
                          memberExpr.object.range,
                          ` satisfies string`,
                        ),
                      ],
                    },
                  ]
                : null,
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
