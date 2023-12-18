import {
  isTypeAnyType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'thenable-in-promise-aggregators',
  meta: {
    docs: {
      description:
        'Disallow passing non-Thenable values to promise aggregators',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      inArray:
        'Unexpected non-Thenable value in array passed to promise aggregator.',
      arrayArg:
        'Unexpected array of non-Thenable values passed to promise aggregator.',
      nonArrayArg: 'Unexpected non-array passed to promise aggregator.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      CallExpression(node: TSESTree.CallExpression): void {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }
        if (node.callee.object.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        if (node.callee.object.name !== 'Promise') {
          return;
        }
        if (node.callee.property.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        const { name } = node.callee.property;
        if (!['race', 'all', 'allSettled'].includes(name)) {
          return;
        }

        const { arguments: args } = node;
        if (args.length !== 1) {
          return;
        }

        const arg = args[0];
        if (arg.type === AST_NODE_TYPES.ArrayExpression) {
          const { elements } = arg;
          if (elements.length === 0) {
            return;
          }

          for (const element of elements) {
            if (element == null) {
              continue;
            }
            const elementType = services.getTypeAtLocation(element);
            if (isTypeAnyType(elementType) || isTypeUnknownType(elementType)) {
              continue;
            }

            const originalNode = services.esTreeNodeToTSNodeMap.get(element);
            if (tsutils.isThenableType(checker, originalNode, elementType)) {
              continue;
            }

            context.report({
              messageId: 'inArray',
              node: element,
            });
          }
        } else {
          const argType = services.getTypeAtLocation(arg);
          if (isTypeAnyType(argType) || isTypeUnknownType(argType)) {
            return;
          }

          if (!checker.isArrayType(argType)) {
            context.report({
              messageId: 'nonArrayArg',
              node: arg,
            });
            return;
          }

          if (argType.typeArguments === undefined) {
            return;
          }

          if (argType.typeArguments.length < 1) {
            return;
          }

          const typeArg = argType.typeArguments[0];
          if (isTypeAnyType(typeArg) || isTypeUnknownType(typeArg)) {
            return;
          }

          const originalNode = services.esTreeNodeToTSNodeMap.get(arg);
          if (tsutils.isThenableType(checker, originalNode, typeArg)) {
            return;
          }

          context.report({
            messageId: 'arrayArg',
            node: arg,
          });
        }
      },
    };
  },
});
