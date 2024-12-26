import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getParserServices,
  isErrorLike,
  isTypeAnyType,
  isTypeUnknownType,
  typeMatchesSomeSpecifier,
  typeOrValueSpecifiersSchema,
} from '../util';

export type MessageIds = 'object' | 'undef';

export type Options = [
  {
    allow?: TypeOrValueSpecifier[];
    allowThrowingAny?: boolean;
    allowThrowingUnknown?: boolean;
  },
];

export default createRule<Options, MessageIds>({
  name: 'only-throw-error',
  meta: {
    type: 'problem',
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
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: {
            ...typeOrValueSpecifiersSchema,
            description: 'Type specifiers that can be thrown.',
          },
          allowThrowingAny: {
            type: 'boolean',
            description:
              'Whether to always allow throwing values typed as `any`.',
          },
          allowThrowingUnknown: {
            type: 'boolean',
            description:
              'Whether to always allow throwing values typed as `unknown`.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allow: [],
      allowThrowingAny: true,
      allowThrowingUnknown: true,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const allow = options.allow;
    function checkThrowArgument(node: TSESTree.Node): void {
      if (
        node.type === AST_NODE_TYPES.AwaitExpression ||
        node.type === AST_NODE_TYPES.YieldExpression
      ) {
        return;
      }

      const type = services.getTypeAtLocation(node);

      if (typeMatchesSomeSpecifier(type, allow, services.program)) {
        return;
      }

      if (type.flags & ts.TypeFlags.Undefined) {
        context.report({ node, messageId: 'undef' });
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

      context.report({ node, messageId: 'object' });
    }

    return {
      ThrowStatement(node): void {
        checkThrowArgument(node.argument);
      },
    };
  },
});
