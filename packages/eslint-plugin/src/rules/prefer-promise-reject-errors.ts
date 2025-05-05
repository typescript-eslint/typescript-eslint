import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getParserServices,
  isErrorLike,
  isTypeAnyType,
  isTypeUnknownType,
  isFunction,
  isIdentifier,
  isPromiseConstructorLike,
  isPromiseLike,
  isReadonlyErrorLike,
  isStaticMemberAccessOfValue,
  skipChainExpression,
} from '../util';

export type MessageIds = 'rejectAnError';

export type Options = [
  {
    allowEmptyReject?: boolean;
    allowThrowingAny?: boolean;
    allowThrowingUnknown?: boolean;
  },
];

export default createRule<Options, MessageIds>({
  name: 'prefer-promise-reject-errors',
  meta: {
    type: 'suggestion',
    docs: {
      extendsBaseRule: true,
      recommended: 'recommended',
      description: 'Require using Error objects as Promise rejection reasons',
      requiresTypeChecking: true,
    },
    messages: {
      rejectAnError: 'Expected the Promise rejection reason to be an Error.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowEmptyReject: {
            type: 'boolean',
            description:
              'Whether to allow calls to `Promise.reject()` with no arguments.',
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
      allowEmptyReject: false,
      allowThrowingAny: false,
      allowThrowingUnknown: false,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);

    function checkRejectCall(callExpression: TSESTree.CallExpression): void {
      const argument = callExpression.arguments.at(0);
      if (argument) {
        const type = services.getTypeAtLocation(argument);

        if (options.allowThrowingAny && isTypeAnyType(type)) {
          return;
        }

        if (options.allowThrowingUnknown && isTypeUnknownType(type)) {
          return;
        }

        if (
          isErrorLike(services.program, type) ||
          isReadonlyErrorLike(services.program, type)
        ) {
          return;
        }
      } else if (options.allowEmptyReject) {
        return;
      }

      context.report({
        node: callExpression,
        messageId: 'rejectAnError',
      });
    }

    function typeAtLocationIsLikePromise(node: TSESTree.Node): boolean {
      const type = services.getTypeAtLocation(node);
      return (
        isPromiseConstructorLike(services.program, type) ||
        isPromiseLike(services.program, type)
      );
    }

    return {
      CallExpression(node): void {
        const callee = skipChainExpression(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        if (
          !isStaticMemberAccessOfValue(callee, context, 'reject') ||
          !typeAtLocationIsLikePromise(callee.object)
        ) {
          return;
        }

        checkRejectCall(node);
      },
      NewExpression(node): void {
        const callee = skipChainExpression(node.callee);
        if (
          !isPromiseConstructorLike(
            services.program,
            services.getTypeAtLocation(callee),
          )
        ) {
          return;
        }

        const executor = node.arguments.at(0);
        if (!executor || !isFunction(executor)) {
          return;
        }
        const rejectParamNode = executor.params.at(1);
        if (!rejectParamNode || !isIdentifier(rejectParamNode)) {
          return;
        }

        // reject param is always present in variables declared by executor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rejectVariable = context.sourceCode
          .getDeclaredVariables(executor)
          .find(variable => variable.identifiers.includes(rejectParamNode))!;

        rejectVariable.references.forEach(ref => {
          if (
            ref.identifier.parent.type !== AST_NODE_TYPES.CallExpression ||
            ref.identifier !== ref.identifier.parent.callee
          ) {
            return;
          }

          checkRejectCall(ref.identifier.parent);
        });
      },
    };
  },
});
