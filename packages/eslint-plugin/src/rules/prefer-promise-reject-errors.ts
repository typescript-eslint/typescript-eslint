import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { getDeclaredVariables } from '@typescript-eslint/utils/eslint-utils';

import {
  createRule,
  getParserServices,
  isErrorLike,
  isFunction,
  isIdentifier,
  isPromiseConstructorLike,
  isPromiseLike,
} from '../util';

export type MessageIds = 'rejectAnError';

export type Options = [
  {
    allowEmptyReject?: boolean;
  },
];

export default createRule<Options, MessageIds>({
  name: 'prefer-promise-reject-errors',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require using Error objects as Promise rejection reasons',
      recommended: 'strict',
      extendsBaseRule: true,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowEmptyReject: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rejectAnError: 'Expected the Promise rejection reason to be an Error.',
    },
  },
  defaultOptions: [
    {
      allowEmptyReject: false,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);

    function checkRejectCall(callExpression: TSESTree.CallExpression): void {
      const argument = callExpression.arguments.at(0);
      if (!argument && options.allowEmptyReject) {
        return;
      }

      if (
        !argument ||
        !isErrorLike(services.program, services.getTypeAtLocation(argument))
      ) {
        context.report({
          node: callExpression,
          messageId: 'rejectAnError',
        });
      }
    }

    function skipChainExpression<T extends TSESTree.Node>(
      node: T,
    ): T | TSESTree.ChainElement {
      return node.type === AST_NODE_TYPES.ChainExpression
        ? node.expression
        : node;
    }

    return {
      CallExpression(node): void {
        const callee = skipChainExpression(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const calleeObjectType = services.getTypeAtLocation(callee.object);

        const rejectMethodCalled = callee.computed
          ? callee.property.type === AST_NODE_TYPES.Literal &&
            callee.property.value === 'reject'
          : callee.property.name === 'reject';
        const calleeIsLikePromise =
          isPromiseConstructorLike(services.program, calleeObjectType) ||
          isPromiseLike(services.program, calleeObjectType);

        if (!rejectMethodCalled || !calleeIsLikePromise) {
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
        const rejectVariable = getDeclaredVariables(context, executor).find(
          variable => variable.identifiers.includes(rejectParamNode),
        )!;

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
