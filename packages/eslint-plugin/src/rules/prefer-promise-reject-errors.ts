import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';
import {
  createRule,
  getParserServices,
  isErrorLike,
  isFunction,
  isIdentifier,
} from '../util';

import { getDeclaredVariables } from '@typescript-eslint/utils/eslint-utils';

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
    const program = services.program;

    function checkRejectCall(callExpression: TSESTree.CallExpression) {
      const argument = callExpression.arguments.at(0);
      if (!argument && options.allowEmptyReject) {
        return;
      }

      if (
        !argument ||
        !isErrorLike(program, services.getTypeAtLocation(argument))
      ) {
        context.report({
          node: callExpression,
          messageId: 'rejectAnError',
        });
      }
    }

    function isPromiseConstructorLike(type: ts.Type): boolean {
      const symbol = type.getSymbol();
      if (!symbol) {
        return false;
      }

      if (symbol.getName() === 'PromiseConstructor') {
        const declarations = symbol.getDeclarations() ?? [];
        for (const declaration of declarations) {
          const sourceFile = declaration.getSourceFile();
          if (program.isSourceFileDefaultLibrary(sourceFile)) {
            return true;
          }
        }
      }

      return false;
    }

    function skipChainExpression<T>(node: T): T & TSESTree.ChainElement {
      // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/issues/8008
      return node.type === AST_NODE_TYPES.ChainExpression
        ? // @ts-expect-error ^
          node.expression
        : node;
    }

    return {
      CallExpression(node) {
        const callee = skipChainExpression(node.callee);
        if (
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.computed
        ) {
          return;
        }

        if (
          callee.property.name !== 'reject' ||
          !isPromiseConstructorLike(services.getTypeAtLocation(callee.object))
        ) {
          return;
        }

        checkRejectCall(node);
      },
      NewExpression(node) {
        const callee = skipChainExpression(node.callee);
        if (!isPromiseConstructorLike(services.getTypeAtLocation(callee))) {
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

        const rejectVariable = getDeclaredVariables(context, executor).find(
          variable => variable.identifiers.includes(rejectParamNode),
        );
        if (!rejectVariable) {
          return;
        }

        const references = rejectVariable.references.filter(
          ref =>
            ref.isRead() &&
            ref.identifier.parent.type === 'CallExpression' &&
            ref.identifier === ref.identifier.parent.callee,
        );

        references.forEach(ref => {
          if (ref.identifier.parent.type !== AST_NODE_TYPES.CallExpression) {
            return;
          }

          checkRejectCall(ref.identifier.parent);
        });
      },
    };
  },
});
