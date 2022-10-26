import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';

import * as util from '../util';
import { getThisExpression } from '../util';

const enum State {
  Unsafe = 1,
  Safe = 2,
}

export default util.createRule({
  name: 'no-unsafe-member-access',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow member access on a value with type `any`',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeMemberExpression:
        'Unsafe member access {{property}} on an `any` value.',
      unsafeThisMemberExpression: [
        'Unsafe member access {{property}} on an `any` value. `this` is typed as `any`.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
      unsafeComputedMemberAccess:
        'Computed name {{property}} resolves to an any value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();
    const compilerOptions = program.getCompilerOptions();
    const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'noImplicitThis',
    );
    const sourceCode = context.getSourceCode();

    const stateCache = new Map<TSESTree.Node, State>();

    function checkMemberExpression(node: TSESTree.MemberExpression): State {
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

      const tsNode = esTreeNodeToTSNodeMap.get(node.object);
      const type = checker.getTypeAtLocation(tsNode);
      const state = util.isTypeAnyType(type) ? State.Unsafe : State.Safe;
      stateCache.set(node, state);

      if (state === State.Unsafe) {
        const propertyName = sourceCode.getText(node.property);

        let messageId: 'unsafeMemberExpression' | 'unsafeThisMemberExpression' =
          'unsafeMemberExpression';

        if (!isNoImplicitThis) {
          // `this.foo` or `this.foo[bar]`
          const thisExpression = getThisExpression(node);

          if (
            thisExpression &&
            util.isTypeAnyType(
              util.getConstrainedTypeAtLocation(
                checker,
                esTreeNodeToTSNodeMap.get(thisExpression),
              ),
            )
          ) {
            messageId = 'unsafeThisMemberExpression';
          }
        }

        context.report({
          node,
          messageId,
          data: {
            property: node.computed ? `[${propertyName}]` : `.${propertyName}`,
          },
        });
      }

      return state;
    }

    return {
      // ignore MemberExpression if it's parent is TSClassImplements or TSInterfaceHeritage
      ':not(TSClassImplements, TSInterfaceHeritage) > MemberExpression':
        checkMemberExpression,
      'MemberExpression[computed = true] > *.property'(
        node: TSESTree.Expression,
      ): void {
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

        const tsNode = esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode);

        if (util.isTypeAnyType(type)) {
          const propertyName = sourceCode.getText(node);
          context.report({
            node,
            messageId: 'unsafeComputedMemberAccess',
            data: {
              property: `[${propertyName}]`,
            },
          });
        }
      },
    };
  },
});
