import type { TSESTree } from '@typescript-eslint/utils';

// eslint-disable-next-line @typescript-eslint/internal/no-typescript-estree-import -- just importing the type
import type { TSESTreeToTSNode } from '@typescript-eslint/typescript-estree';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isThenableType } from 'ts-api-utils';
import * as ts from 'typescript';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  findVariable,
  getParserServices,
  isErrorLike,
  isTypeAnyType,
  isTypeUnknownType,
  typeMatchesSomeSpecifier,
  typeOrValueSpecifiersSchema,
} from '../util';
import { parseCatchCall, parseThenCall } from '../util/promiseUtils';

export type MessageIds = 'object' | 'undef';

export type Options = [
  {
    allow?: TypeOrValueSpecifier[];
    allowThrowingAny?: boolean;
    allowThrowingUnknown?: boolean;
    allowRethrowing?: boolean;
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
          allowRethrowing: {
            type: 'boolean',
            description: 'Whether to allow rethrowing caught values',
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
      allowRethrowing: true,
      allowThrowingAny: true,
      allowThrowingUnknown: true,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const allow = options.allow;

    function isRethrownError(node: TSESTree.Node): boolean {
      if (node.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const scope = context.sourceCode.getScope(node);

      const smVariable = findVariable(scope, node.name);

      if (smVariable == null) {
        return false;
      }
      const variableDefinitions = smVariable.defs.filter(
        def => def.isVariableDefinition,
      );
      if (variableDefinitions.length !== 1) {
        return false;
      }
      const def = smVariable.defs[0];

      // try { /* ... */ } catch (x) { throw x; }
      if (def.node.type === AST_NODE_TYPES.CatchClause) {
        return true;
      }

      // promise.catch(x => { throw x; })
      // promise.then(onFulfilled, x => { throw x; })
      if (
        def.node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        def.node.params.length >= 1 &&
        def.node.params[0] === def.name &&
        def.node.parent.type === AST_NODE_TYPES.CallExpression
      ) {
        const callExpression = def.node.parent;

        const parsedPromiseHandlingCall =
          parseCatchCall(callExpression, context) ??
          parseThenCall(callExpression, context);
        if (parsedPromiseHandlingCall != null) {
          const { object, onRejected } = parsedPromiseHandlingCall;
          if (onRejected === def.node) {
            const tsObjectNode = services.esTreeNodeToTSNodeMap.get(object);

            // make sure we're actually dealing with a promise
            if (
              isThenableType(
                services.program.getTypeChecker(),
                tsObjectNode satisfies TSESTreeToTSNode<TSESTree.Expression> as ts.Expression,
              )
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }

    function checkThrowArgument(node: TSESTree.Node): void {
      if (
        node.type === AST_NODE_TYPES.AwaitExpression ||
        node.type === AST_NODE_TYPES.YieldExpression
      ) {
        return;
      }

      if (options.allowRethrowing && isRethrownError(node)) {
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
