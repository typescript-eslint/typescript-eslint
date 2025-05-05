import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getThisExpression,
  isBuiltinSymbolLike,
  isTypeAnyType,
} from '../util';

export type MessageIds =
  | 'unsafeCall'
  | 'unsafeCallThis'
  | 'unsafeNew'
  | 'unsafeTemplateTag';

export default createRule<[], MessageIds>({
  name: 'no-unsafe-call',
  meta: {
    type: 'problem',
    docs: {
      recommended: 'recommended',
      description: 'Disallow calling a value with type `any`',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeCall: 'Unsafe call of a(n) {{type}} typed value.',
      unsafeCallThis: [
        'Unsafe call of a(n) {{type}} typed value. `this` is typed as {{type}}.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
      unsafeNew: 'Unsafe construction of a(n) {{type}} typed value.',
      unsafeTemplateTag: 'Unsafe use of a(n) {{type}} typed template tag.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const compilerOptions = services.program.getCompilerOptions();
    const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'noImplicitThis',
    );

    function checkCall(
      node: TSESTree.Node,
      reportingNode: TSESTree.Node,
      messageId: MessageIds,
    ): void {
      const type = getConstrainedTypeAtLocation(services, node);

      if (isTypeAnyType(type)) {
        if (!isNoImplicitThis) {
          // `this()` or `this.foo()` or `this.foo[bar]()`
          const thisExpression = getThisExpression(node);
          if (
            thisExpression &&
            isTypeAnyType(
              getConstrainedTypeAtLocation(services, thisExpression),
            )
          ) {
            messageId = 'unsafeCallThis';
          }
        }

        const isErrorType = tsutils.isIntrinsicErrorType(type);

        context.report({
          node: reportingNode,
          messageId,
          data: {
            type: isErrorType ? '`error` type' : '`any`',
          },
        });
        return;
      }

      if (isBuiltinSymbolLike(services.program, type, 'Function')) {
        // this also matches subtypes of `Function`, like `interface Foo extends Function {}`.
        //
        // For weird TS reasons that I don't understand, these are
        //
        // safe to construct if:
        // - they have at least one call signature _that is not void-returning_,
        // - OR they have at least one construct signature.
        //
        // safe to call (including as template) if:
        // - they have at least one call signature
        // - OR they have at least one construct signature.

        const constructSignatures = type.getConstructSignatures();
        if (constructSignatures.length > 0) {
          return;
        }

        const callSignatures = type.getCallSignatures();
        if (messageId === 'unsafeNew') {
          if (
            callSignatures.some(
              signature =>
                !tsutils.isIntrinsicVoidType(signature.getReturnType()),
            )
          ) {
            return;
          }
        } else if (callSignatures.length > 0) {
          return;
        }

        context.report({
          node: reportingNode,
          messageId,
          data: {
            type: '`Function`',
          },
        });
        return;
      }
    }

    return {
      'CallExpression > *.callee'(
        node: TSESTree.CallExpression['callee'],
      ): void {
        checkCall(node, node, 'unsafeCall');
      },
      NewExpression(node): void {
        checkCall(node.callee, node, 'unsafeNew');
      },
      'TaggedTemplateExpression > *.tag'(node: TSESTree.Node): void {
        checkCall(node, node, 'unsafeTemplateTag');
      },
    };
  },
});
