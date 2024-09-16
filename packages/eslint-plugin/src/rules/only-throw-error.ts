import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isErrorLike,
  isTypeAnyType,
  isTypeUnknownType,
} from '../util';

type MessageIds = 'object' | 'undef';

type Options = [
  {
    allowThrowingAny?: boolean;
    allowThrowingUnknown?: boolean;
  },
];

export default createRule<Options, MessageIds>({
  create(context, [options]) {
    const services = getParserServices(context);

    function checkThrowArgument(node: TSESTree.Node): void {
      if (
        node.type === AST_NODE_TYPES.AwaitExpression ||
        node.type === AST_NODE_TYPES.YieldExpression
      ) {
        return;
      }

      const type = services.getTypeAtLocation(node);

      if (type.flags & ts.TypeFlags.Undefined) {
        context.report({ messageId: 'undef', node });
        return;
      }

      if (options.allowThrowingAny && isTypeAnyType(type)) {
        return;
      }

      if (options.allowThrowingUnknown && isTypeUnknownType(type)) {
        return;
      }

      if (isErrorLike(services.program, type)) {
        return;
      }

      context.report({ messageId: 'object', node });
    }

    return {
      ThrowStatement(node): void {
        if (node.argument) {
          checkThrowArgument(node.argument);
        }
      },
    };
  },
  defaultOptions: [
    {
      allowThrowingAny: true,
      allowThrowingUnknown: true,
    },
  ],
  meta: {
    docs: {
      description: 'Disallow throwing non-`Error` values as exceptions',
      extendsBaseRule: 'no-throw-literal',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      object: 'Expected an error object to be thrown.',
      undef: 'Do not throw undefined.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowThrowingAny: {
            type: 'boolean',
          },
          allowThrowingUnknown: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
  name: 'only-throw-error',
});
