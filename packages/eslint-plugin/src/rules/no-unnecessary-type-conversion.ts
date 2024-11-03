import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleFix } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeFlagSet,
} from '../util';

type Options = [];
type MessageIds = 'unnecessaryTypeConversion';

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
    messages: {
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

    return {
      'AssignmentExpression[operator = "+="], BinaryExpression[operator = "+"]'(
        node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
      ): void {
        const leftType = services.getTypeAtLocation(node.left);
        const rightType = services.getTypeAtLocation(node.right);
        if (
          doesUnderlyingTypeMatchFlag(leftType, ts.TypeFlags.StringLike) &&
          node.right.type === AST_NODE_TYPES.Literal &&
          node.right.value === ''
        ) {
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
            fix: (fixer): RuleFix[] => [
              fixer.removeRange([node.range[0], node.left.range[0]]),
              fixer.removeRange([node.left.range[1], node.range[1]]),
            ],
          });
        }
        if (
          node.left.type === AST_NODE_TYPES.Literal &&
          node.left.value === '' &&
          doesUnderlyingTypeMatchFlag(rightType, ts.TypeFlags.StringLike)
        ) {
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
            fix: (fixer): RuleFix[] => [
              fixer.removeRange([node.range[0], node.right.range[0]]),
              fixer.removeRange([node.right.range[1], node.range[1]]),
            ],
          });
        }
      },
      CallExpression(node: TSESTree.CallExpression): void {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.arguments.length === 1
        ) {
          const type = getConstrainedTypeAtLocation(
            services,
            node.arguments[0],
          );

          if (
            (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.StringLike) &&
              // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
              node.callee.name === 'String') ||
            (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.NumberLike) &&
              node.callee.name === 'Number') ||
            (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.BooleanLike) &&
              // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
              node.callee.name === 'Boolean') ||
            (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.BigIntLike) &&
              node.callee.name === 'BigInt')
          ) {
            context.report({
              node,
              messageId: 'unnecessaryTypeConversion',
              data: {
                type: node.callee.name.toLowerCase(),
                violation: `Passing a ${node.callee.name.toLowerCase()} to ${node.callee.name}()`,
              },
              fix: (fixer): RuleFix[] => [
                fixer.removeRange([node.range[0], node.arguments[0].range[0]]),
                fixer.removeRange([node.arguments[0].range[1], node.range[1]]),
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
          context.report({
            loc: {
              start: memberExpr.object.loc.end,
              end: memberExpr.parent.loc.end,
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'string',
              violation: 'Using .toString() on a string',
            },
            fix: (fixer): RuleFix[] => [
              fixer.removeRange([
                memberExpr.parent.range[0],
                memberExpr.object.range[0],
              ]),
              fixer.removeRange([
                memberExpr.object.range[1],
                memberExpr.parent.range[1],
              ]),
            ],
          });
        }
      },
      'UnaryExpression[operator = "!"] > UnaryExpression[operator = "!"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        const type = services.getTypeAtLocation(node.argument);
        if (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.BooleanLike)) {
          context.report({
            loc: {
              start: node.parent.loc.start,
              end: {
                column: node.loc.start.column + 1,
                line: node.loc.start.line,
              },
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'boolean',
              violation: 'Using !! on a boolean',
            },
            fix: (fixer): RuleFix[] => [
              fixer.removeRange([node.parent.range[0], node.argument.range[0]]),
              fixer.removeRange([node.argument.range[1], node.range[1]]),
            ],
          });
        }
      },
      'UnaryExpression[operator = "+"]'(node: TSESTree.UnaryExpression): void {
        const type = services.getTypeAtLocation(node.argument);
        if (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.NumberLike)) {
          context.report({
            loc: {
              start: node.loc.start,
              end: {
                column: node.loc.start.column + 1,
                line: node.loc.start.line,
              },
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'number',
              violation: 'Using the unary + operator on a number',
            },
            fix: (fixer): RuleFix[] => [
              fixer.removeRange([node.range[0], node.argument.range[0]]),
              fixer.removeRange([node.argument.range[1], node.range[1]]),
            ],
          });
        }
      },
      'UnaryExpression[operator = "~"] > UnaryExpression[operator = "~"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        const type = services.getTypeAtLocation(node.argument);
        if (doesUnderlyingTypeMatchFlag(type, ts.TypeFlags.NumberLike)) {
          context.report({
            loc: {
              start: node.parent.loc.start,
              end: {
                column: node.loc.start.column + 1,
                line: node.loc.start.line,
              },
            },
            messageId: 'unnecessaryTypeConversion',
            data: {
              type: 'number',
              violation: 'Using ~~ on a number',
            },
            fix: (fixer): RuleFix[] => [
              fixer.removeRange([node.parent.range[0], node.argument.range[0]]),
              fixer.removeRange([node.argument.range[1], node.range[1]]),
            ],
          });
        }
      },
    };
  },
});
