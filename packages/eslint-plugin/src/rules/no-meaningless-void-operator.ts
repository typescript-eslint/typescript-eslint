import type {
  ParserServicesWithTypeInformation,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/utils';

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

const PRIMITIVE_TYPE_FLAGS =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.ESSymbolLike;

function isClearlyMeaninglessMemberAccess(
  node: TSESTree.MemberExpression,
  services: ParserServicesWithTypeInformation,
  program: ts.Program,
): boolean {
  if (!isClearlyMeaninglessExpression(node.object, services, program)) {
    return false;
  }

  if (!node.computed) {
    return true;
  }

  return isClearlyMeaninglessExpression(node.property, services, program);
}

function isClearlyMeaninglessExpression(
  node: TSESTree.Expression,
  services: ParserServicesWithTypeInformation,
  program: ts.Program,
): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.ChainExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSInstantiationExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return isClearlyMeaninglessExpression(node.expression, services, program);

    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.Literal:
    case AST_NODE_TYPES.ThisExpression:
      return true;

    case AST_NODE_TYPES.MemberExpression:
      return isClearlyMeaninglessMemberAccess(node, services, program);

    case AST_NODE_TYPES.CallExpression:
      return isSideEffectFreeMethodCallOnPrimitive(node, services, program);

    default:
      return false;
  }
}

function isSideEffectFreeMethodCallOnPrimitive(
  node: TSESTree.CallExpression,
  services: ParserServicesWithTypeInformation,
  program: ts.Program,
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

  if (!isClearlyMeaninglessExpression(object, services, program)) {
    return false;
  }

  const objectType = getConstrainedTypeAtLocation(services, object);
  if (
    !tsutils
      .unionConstituents(objectType)
      .every(part => tsutils.isTypeFlagSet(part, PRIMITIVE_TYPE_FLAGS))
  ) {
    return false;
  }

  const propertySymbol = services.getSymbolAtLocation(property);
  return (
    propertySymbol != null &&
    isSymbolFromDefaultLibrary(program, propertySymbol)
  );
}

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

        if (!isClearlyMeaninglessExpression(node.argument, services, program)) {
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
