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
  | 'errorCall'
  | 'errorCallThis'
  | 'errorNew'
  | 'errorTemplateTag'
  | 'unsafeCall'
  | 'unsafeCallThis'
  | 'unsafeNew'
  | 'unsafeTemplateTag';

export default createRule<[], MessageIds>({
  name: 'no-unsafe-call',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow calling a value with type `any`',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      errorCall: 'Unsafe call of a type that could not be resolved.',
      errorCallThis: [
        'Unsafe call of a `this` type that could not be resolved.',
      ].join('\n'),
      errorNew: 'Unsafe construction of a type that could not be resolved.',
      errorTemplateTag:
        'Unsafe use of a template tag whose type could not be resolved.',
      unsafeCall: 'Unsafe call of {{type}} typed value.',
      unsafeCallThis: [
        'Unsafe call of {{type}} typed value. `this` is typed as {{type}}.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
      unsafeNew: 'Unsafe construction of {{type}} typed value.',
      unsafeTemplateTag: 'Unsafe use of {{type}} typed template tag.',
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
      unsafeMessageId: Extract<MessageIds, `unsafe${string}`>,
      errorMessageId: Extract<MessageIds, `error${string}`>,
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
            unsafeMessageId = 'unsafeCallThis';
            errorMessageId = 'errorCallThis';
          }
        }

        const isErrorType = tsutils.isIntrinsicErrorType(type);

        context.report({
          node: reportingNode,
          messageId: isErrorType ? errorMessageId : unsafeMessageId,
          data: {
            type: 'an `any`',
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
        if (unsafeMessageId === 'unsafeNew') {
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
          messageId: unsafeMessageId,
          data: {
            type: 'a `Function`',
          },
        });
        return;
      }
    }

    return {
      'CallExpression > *.callee'(
        node: TSESTree.CallExpression['callee'],
      ): void {
        checkCall(node, node, 'unsafeCall', 'errorCall');
      },
      NewExpression(node): void {
        checkCall(node.callee, node, 'unsafeNew', 'errorNew');
      },
      'TaggedTemplateExpression > *.tag'(node: TSESTree.Node): void {
        checkCall(node, node, 'unsafeTemplateTag', 'errorTemplateTag');
      },
    };
  },
});
