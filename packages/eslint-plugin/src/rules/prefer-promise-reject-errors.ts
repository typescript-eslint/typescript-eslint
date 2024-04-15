import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getParserServices,
  isErrorLike,
  isFunction,
  isIdentifier,
  isPromiseConstructorLike,
  isPromiseLike,
  isReadonlyErrorLike,
  isStaticKeyOfValue,
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
      if (argument) {
        const type = services.getTypeAtLocation(argument);
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

    function skipChainExpression<T extends TSESTree.Node>(
      node: T,
    ): T | TSESTree.ChainElement {
      return node.type === AST_NODE_TYPES.ChainExpression
        ? node.expression
        : node;
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

        const rejectMethodCalled = callee.computed
          ? callee.property.type === AST_NODE_TYPES.Literal &&
            callee.property.value === 'reject'
          : callee.property.name === 'reject';

        isStaticKeyOfValue();

        if (
          !rejectMethodCalled ||
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
