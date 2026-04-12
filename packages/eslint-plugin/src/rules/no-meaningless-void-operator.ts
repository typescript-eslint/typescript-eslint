import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  isSymbolFromDefaultLibrary,
} from '../util';

export type Options = [
  {
    checkNever: boolean;
  },
];

const sideEffectFreeStringMethods = new Set([
  'normalize',
  'toLocaleLowerCase',
  'toLocaleUpperCase',
  'toLowerCase',
  'toString',
  'toUpperCase',
  'trim',
  'trimEnd',
  'trimLeft',
  'trimRight',
  'trimStart',
  'valueOf',
]);

export default createRule<Options, 'meaninglessVoidOperator' | 'removeVoid'>({
  name: 'no-meaningless-void-operator',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the `void` operator except when used to discard a value',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      meaninglessVoidOperator:
        "void operator shouldn't be used on {{type}}; it should convey that a return value is being ignored",
      removeVoid: "Remove 'void'",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkNever: {
            type: 'boolean',
            description:
              'Whether to suggest removing `void` when the argument has type `never`.',
          },
        },
      },
    ],
  },
  defaultOptions: [{ checkNever: false }],

  create(context, [{ checkNever }]) {
    const services = ESLintUtils.getParserServices(context);
    const { program } = services;
    const checker = program.getTypeChecker();

    function isClearlyMeaninglessMemberAccess(
      node: TSESTree.MemberExpression,
    ): boolean {
      if (!isClearlyMeaninglessExpression(node.object)) {
        return false;
      }

      if (!node.computed) {
        return true;
      }

      return isClearlyMeaninglessExpression(node.property);
    }

    function isClearlyMeaninglessExpression(
      node: TSESTree.Expression,
    ): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.ChainExpression:
          return isClearlyMeaninglessExpression(node.expression);

        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSInstantiationExpression:
        case AST_NODE_TYPES.TSNonNullExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
          return isClearlyMeaninglessExpression(node.expression);

        case AST_NODE_TYPES.Identifier:
        case AST_NODE_TYPES.Literal:
        case AST_NODE_TYPES.ThisExpression:
          return true;

        case AST_NODE_TYPES.MemberExpression:
          return isClearlyMeaninglessMemberAccess(node);

        case AST_NODE_TYPES.CallExpression:
          return isSideEffectFreeStringMethodCall(node);

        default:
          return false;
      }
    }

    function isSideEffectFreeStringMethodCall(
      node: TSESTree.CallExpression,
    ): boolean {
      const { callee } = node;
      if (
        node.optional ||
        node.arguments.length > 0 ||
        callee.type !== AST_NODE_TYPES.MemberExpression ||
        callee.computed ||
        callee.optional
      ) {
        return false;
      }

      const { object, property } = callee;
      if (property.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      if (!sideEffectFreeStringMethods.has(property.name)) {
        return false;
      }

      if (!isClearlyMeaninglessExpression(object)) {
        return false;
      }

      const objectType = getConstrainedTypeAtLocation(services, object);
      if (
        !tsutils
          .unionConstituents(objectType)
          .every(part => tsutils.isTypeFlagSet(part, ts.TypeFlags.StringLike))
      ) {
        return false;
      }

      const propertySymbol = services.getSymbolAtLocation(property);
      return (
        propertySymbol != null &&
        isSymbolFromDefaultLibrary(program, propertySymbol)
      );
    }

    return {
      'UnaryExpression[operator="void"]'(node: TSESTree.UnaryExpression): void {
        const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
          return fixer.removeRange([
            context.sourceCode.getTokens(node)[0].range[0],
            context.sourceCode.getTokens(node)[1].range[0],
          ]);
        };

        const argType = services.getTypeAtLocation(node.argument);
        const unionParts = tsutils.unionConstituents(argType);
        if (
          unionParts.every(part =>
            tsutils.isTypeFlagSet(
              part,
              ts.TypeFlags.Void | ts.TypeFlags.Undefined,
            ),
          )
        ) {
          context.report({
            node,
            messageId: 'meaninglessVoidOperator',
            data: { type: checker.typeToString(argType) },
            fix,
          });
          return;
        }

        if (
          unionParts.every(part =>
            tsutils.isTypeFlagSet(
              part,
              ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Never,
            ),
          )
        ) {
          if (checkNever) {
            context.report({
              node,
              messageId: 'meaninglessVoidOperator',
              data: { type: checker.typeToString(argType) },
              suggest: [{ messageId: 'removeVoid', fix }],
            });
          }
          return;
        }

        if (!isClearlyMeaninglessExpression(node.argument)) {
          return;
        }

        context.report({
          node,
          messageId: 'meaninglessVoidOperator',
          data: { type: checker.typeToString(argType) },
        });
      },
    };
  },
});
