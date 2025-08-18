import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFix, RuleFixer } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
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
  | 'suggestRemove'
  | 'suggestSatisfies'
  | 'unnecessaryTypeConversion';

function isEnumType(type: ts.Type): boolean {
  return (type.getFlags() & ts.TypeFlags.EnumLike) !== 0;
}

function isEnumMemberType(type: ts.Type): boolean {
  const symbol = type.getSymbol();
  if (!symbol) {
    return false;
  }
  return (symbol.flags & ts.SymbolFlags.EnumMember) !== 0;
}

export default createRule<Options, MessageIds>({
  name: 'no-unnecessary-type-conversion',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow conversion idioms when they do not change the type or value of the expression',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      suggestRemove: 'Remove the type conversion.',
      suggestSatisfies:
        'Instead, assert that the value satisfies the {{type}} type.',
      unnecessaryTypeConversion:
        '{{violation}} does not change the type or value of the {{type}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function doesUnderlyingTypeMatchFlag(
      type: ts.Type,
      typeFlag: ts.TypeFlags,
    ): boolean {
      return tsutils
        .unionConstituents(type)
        .every(t => isTypeFlagSet(t, typeFlag));
    }

    const services = getParserServices(context);

    function handleUnaryOperator(
      node: TSESTree.UnaryExpression,
      typeFlag: ts.TypeFlags,
      typeString: 'boolean' | 'number',
      violation: string,
      isDoubleOperator: boolean, // !! or ~~
    ) {
      const outerNode = isDoubleOperator ? node.parent : node;
      const type = services.getTypeAtLocation(node.argument);
      if (doesUnderlyingTypeMatchFlag(type, typeFlag)) {
        const wrappingFixerParams = {
          node: outerNode,
          innerNode: [node.argument],
          sourceCode: context.sourceCode,
        };

        context.report({
          loc: {
            start: outerNode.loc.start,
            end: {
              column: node.loc.start.column + 1,
              line: node.loc.start.line,
            },
          },
          messageId: 'unnecessaryTypeConversion',
          data: { type: typeString, violation },
          suggest: [
            {
              messageId: 'suggestRemove',
              fix: getWrappingFixer(wrappingFixerParams),
            },
            {
              messageId: 'suggestSatisfies',
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
            suggest: [
              {
                messageId: 'suggestRemove',
                fix:
                  node.parent.type === AST_NODE_TYPES.ExpressionStatement
                    ? (fixer: RuleFixer): RuleFix[] => [
                        fixer.removeRange([
                          node.parent.range[0],
                          node.parent.range[1],
                        ]),
                      ]
                    : getWrappingFixer(wrappingFixerParams),
              },
              {
                messageId: 'suggestSatisfies',
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
            suggest: [
              {
                messageId: 'suggestRemove',
                fix: getWrappingFixer(wrappingFixerParams),
              },
              {
                messageId: 'suggestSatisfies',
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
            suggest: [
              {
                messageId: 'suggestRemove',
                fix: getWrappingFixer(wrappingFixerParams),
              },
              {
                messageId: 'suggestSatisfies',
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
        const nodeCallee = node.callee;
        const builtInTypeFlags = {
          BigInt: ts.TypeFlags.BigIntLike,
          Boolean: ts.TypeFlags.BooleanLike,
          Number: ts.TypeFlags.NumberLike,
          String: ts.TypeFlags.StringLike,
        };

        if (
          nodeCallee.type !== AST_NODE_TYPES.Identifier ||
          !(nodeCallee.name in builtInTypeFlags)
        ) {
          return;
        }

        const typeFlag =
          builtInTypeFlags[nodeCallee.name as keyof typeof builtInTypeFlags];
        const scope = context.sourceCode.getScope(node);
        const variable = scope.set.get(nodeCallee.name);
        if (
          !!variable?.defs.length ||
          !doesUnderlyingTypeMatchFlag(
            getConstrainedTypeAtLocation(services, node.arguments[0]),
            typeFlag,
          )
        ) {
          return;
        }

        const wrappingFixerParams = {
          node,
          innerNode: [node.arguments[0]],
          sourceCode: context.sourceCode,
        };
        const typeString = nodeCallee.name.toLowerCase();

        context.report({
          node: nodeCallee,
          messageId: 'unnecessaryTypeConversion',
          data: {
            type: nodeCallee.name.toLowerCase(),
            violation: `Passing a ${typeString} to ${nodeCallee.name}()`,
          },
          suggest: [
            {
              messageId: 'suggestRemove',
              fix: getWrappingFixer(wrappingFixerParams),
            },
            {
              messageId: 'suggestSatisfies',
              data: { type: typeString },
              fix: getWrappingFixer({
                ...wrappingFixerParams,
                wrap: expr => `${expr} satisfies ${typeString}`,
              }),
            },
          ],
        });
      },
      'CallExpression > MemberExpression.callee > Identifier[name = "toString"].property'(
        node: TSESTree.Expression,
      ): void {
        const memberExpr = node.parent as TSESTree.MemberExpression;
        const type = getConstrainedTypeAtLocation(services, memberExpr.object);

        if (isEnumType(type) || isEnumMemberType(type)) {
          return;
        }

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
            suggest: [
              {
                messageId: 'suggestRemove',
                fix: getWrappingFixer(wrappingFixerParams),
              },
              {
                messageId: 'suggestSatisfies',
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
          'boolean',
          'Using !! on a boolean',
          true,
        );
      },
      'UnaryExpression[operator = "+"]'(node: TSESTree.UnaryExpression): void {
        handleUnaryOperator(
          node,
          ts.TypeFlags.NumberLike,
          'number',
          'Using the unary + operator on a number',
          false,
        );
      },
      'UnaryExpression[operator = "~"] > UnaryExpression[operator = "~"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        handleUnaryOperator(
          node,
          ts.TypeFlags.NumberLike,
          'number',
          'Using ~~ on a number',
          true,
        );
      },
    };
  },
});
