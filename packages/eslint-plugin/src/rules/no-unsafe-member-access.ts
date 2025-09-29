import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getThisExpression,
  isTypeAnyType,
} from '../util';

const enum State {
  Unsafe = 1,
  Safe = 2,
  Chained = 3,
}

function createDataType(type: ts.Type): '`any`' | '`error` typed' {
  const isErrorType = tsutils.isIntrinsicErrorType(type);
  return isErrorType ? '`error` typed' : '`any`';
}

export type Options = [
  {
    allowOptionalChaining?: boolean;
  },
];

export type MessageIds =
  | 'unsafeComputedMemberAccess'
  | 'unsafeMemberExpression'
  | 'unsafeThisMemberExpression';

export default createRule<Options, MessageIds>({
  name: 'no-unsafe-member-access',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow member access on a value with type `any`',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeComputedMemberAccess:
        'Computed name {{property}} resolves to an {{type}} value.',
      unsafeMemberExpression:
        'Unsafe member access {{property}} on an {{type}} value.',
      unsafeThisMemberExpression: [
        'Unsafe member access {{property}} on an `any` value. `this` is typed as `any`.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowOptionalChaining: {
            type: 'boolean',
            description: 'Whether to allow `?.` optional chains on any values.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowOptionalChaining: false,
    },
  ],
  create(context, [{ allowOptionalChaining }]) {
    const services = getParserServices(context);
    const compilerOptions = services.program.getCompilerOptions();
    const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'noImplicitThis',
    );

    const stateCache = new Map<TSESTree.Node, State>();

    // Case notes:
    // value?.outer.middle.inner
    // The ChainExpression is a child of the root expression, and a parent of all the MemberExpressions.
    // But the left-most expression is what we want to report on: the inner-most expressions.
    // In fact, this is true even if the chain is on the inside!
    // value.outer.middle?.inner;
    // It was already true that every `object` (MemberExpression) has optional: boolean

    function checkMemberExpression(node: TSESTree.MemberExpression): State {
      if (allowOptionalChaining && node.optional) {
        stateCache.set(node, State.Chained);
        return State.Chained;
      }

      const cachedState = stateCache.get(node);
      if (cachedState) {
        return cachedState;
      }

      if (node.object.type === AST_NODE_TYPES.MemberExpression) {
        const objectState = checkMemberExpression(node.object);
        if (objectState === State.Unsafe) {
          // if the object is unsafe, we know this will be unsafe as well
          // we don't need to report, as we have already reported on the inner member expr
          stateCache.set(node, objectState);
          return objectState;
        }
      }

      const type = services.getTypeAtLocation(node.object);
      const state = isTypeAnyType(type) ? State.Unsafe : State.Safe;
      stateCache.set(node, state);

      if (state === State.Unsafe) {
        const propertyName = context.sourceCode.getText(node.property);

        let messageId: MessageIds = 'unsafeMemberExpression';

        if (!isNoImplicitThis) {
          // `this.foo` or `this.foo[bar]`
          const thisExpression = getThisExpression(node);

          if (
            thisExpression &&
            isTypeAnyType(
              getConstrainedTypeAtLocation(services, thisExpression),
            )
          ) {
            messageId = 'unsafeThisMemberExpression';
          }
        }

        context.report({
          node: node.property,
          messageId,
          data: {
            type: createDataType(type),
            property: node.computed ? `[${propertyName}]` : `.${propertyName}`,
          },
        });
      }

      return state;
    }

    return {
      // ignore MemberExpressions with ancestors of type `TSClassImplements` or `TSInterfaceHeritage`
      'MemberExpression:not(TSClassImplements MemberExpression, TSInterfaceHeritage MemberExpression)':
        checkMemberExpression,
      'MemberExpression[computed = true] > *.property'(
        node: TSESTree.Expression,
      ): void {
        if (
          allowOptionalChaining &&
          (node.parent as TSESTree.MemberExpression).optional
        ) {
          return;
        }

        if (
          // x[1]
          node.type === AST_NODE_TYPES.Literal ||
          // x[1++] x[++x] etc
          // FUN FACT - **all** update expressions return type number, regardless of the argument's type,
          // because JS engines return NaN if there the argument is not a number.
          node.type === AST_NODE_TYPES.UpdateExpression
        ) {
          // perf optimizations - literals can obviously never be `any`
          return;
        }

        const type = services.getTypeAtLocation(node);

        if (isTypeAnyType(type)) {
          const propertyName = context.sourceCode.getText(node);
          context.report({
            node,
            messageId: 'unsafeComputedMemberAccess',
            data: {
              type: createDataType(type),
              property: `[${propertyName}]`,
            },
          });
        }
      },
    };
  },
});
