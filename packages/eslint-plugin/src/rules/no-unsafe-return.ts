import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  AnyType,
  createRule,
  discriminateAnyType,
  getConstrainedTypeAtLocation,
  getContextualType,
  getParserServices,
  getThisExpression,
  isTypeAnyType,
  isTypeFlagSet,
  isTypeUnknownArrayType,
  isTypeUnknownType,
  isUnsafeAssignment,
} from '../util';
import { getParentFunctionNode } from '../util/getParentFunctionNode';

export default createRule({
  name: 'no-unsafe-return',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow returning a value with type `any` from a function',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeReturn: 'Unsafe return of a value of type {{type}}.',
      unsafeReturnThis: [
        'Unsafe return of a value of type `{{type}}`. `this` is typed as `any`.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
      unsafeReturnAssignment:
        'Unsafe return of type `{{sender}}` from function with return type `{{receiver}}`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();
    const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'noImplicitThis',
    );

    function checkReturn(
      returnNode: TSESTree.Node,
      reportingNode: TSESTree.Node = returnNode,
    ): void {
      const tsNode = services.esTreeNodeToTSNodeMap.get(returnNode);
      const type = checker.getTypeAtLocation(tsNode);

      const anyType = discriminateAnyType(
        type,
        checker,
        services.program,
        tsNode,
      );
      const functionNode = getParentFunctionNode(returnNode);
      /* istanbul ignore if */ if (!functionNode) {
        return;
      }

      // function has an explicit return type, so ensure it's a safe return
      const returnNodeType = getConstrainedTypeAtLocation(services, returnNode);
      const functionTSNode = services.esTreeNodeToTSNodeMap.get(functionNode);

      // function expressions will not have their return type modified based on receiver typing
      // so we have to use the contextual typing in these cases, i.e.
      // const foo1: () => Set<string> = () => new Set<any>();
      // the return type of the arrow function is Set<any> even though the variable is typed as Set<string>
      let functionType =
        ts.isFunctionExpression(functionTSNode) ||
        ts.isArrowFunction(functionTSNode)
          ? getContextualType(checker, functionTSNode)
          : services.getTypeAtLocation(functionNode);
      if (!functionType) {
        functionType = services.getTypeAtLocation(functionNode);
      }
      const callSignatures = tsutils.getCallSignaturesOfType(functionType);
      // If there is an explicit type annotation *and* that type matches the actual
      // function return type, we shouldn't complain (it's intentional, even if unsafe)
      if (functionTSNode.type) {
        for (const signature of callSignatures) {
          const signatureReturnType = signature.getReturnType();

          if (
            returnNodeType === signatureReturnType ||
            isTypeFlagSet(
              signatureReturnType,
              ts.TypeFlags.Any | ts.TypeFlags.Unknown,
            )
          ) {
            return;
          }
          if (functionNode.async) {
            const awaitedSignatureReturnType =
              checker.getAwaitedType(signatureReturnType);

            const awaitedReturnNodeType =
              checker.getAwaitedType(returnNodeType);
            if (
              awaitedReturnNodeType === awaitedSignatureReturnType ||
              (awaitedSignatureReturnType &&
                isTypeFlagSet(
                  awaitedSignatureReturnType,
                  ts.TypeFlags.Any | ts.TypeFlags.Unknown,
                ))
            ) {
              return;
            }
          }
        }
      }

      if (anyType !== AnyType.Safe) {
        // Allow cases when the declared return type of the function is either unknown or unknown[]
        // and the function is returning any or any[].
        for (const signature of callSignatures) {
          const functionReturnType = signature.getReturnType();
          if (
            anyType === AnyType.Any &&
            isTypeUnknownType(functionReturnType)
          ) {
            return;
          }
          if (
            anyType === AnyType.AnyArray &&
            isTypeUnknownArrayType(functionReturnType, checker)
          ) {
            return;
          }
          const awaitedType = checker.getAwaitedType(functionReturnType);
          if (
            awaitedType &&
            anyType === AnyType.PromiseAny &&
            isTypeUnknownType(awaitedType)
          ) {
            return;
          }
        }

        if (anyType === AnyType.PromiseAny && !functionNode.async) {
          return;
        }

        let messageId: 'unsafeReturn' | 'unsafeReturnThis' = 'unsafeReturn';
        const isErrorType = tsutils.isIntrinsicErrorType(returnNodeType);

        if (!isNoImplicitThis) {
          // `return this`
          const thisExpression = getThisExpression(returnNode);
          if (
            thisExpression &&
            isTypeAnyType(
              getConstrainedTypeAtLocation(services, thisExpression),
            )
          ) {
            messageId = 'unsafeReturnThis';
          }
        }

        // If the function return type was not unknown/unknown[], mark usage as unsafeReturn.
        return context.report({
          node: reportingNode,
          messageId,
          data: {
            type: isErrorType
              ? 'error'
              : anyType === AnyType.Any
                ? '`any`'
                : anyType === AnyType.PromiseAny
                  ? '`Promise<any>`'
                  : '`any[]`',
          },
        });
      }

      const signature = functionType.getCallSignatures().at(0);
      if (signature) {
        const functionReturnType = signature.getReturnType();
        const result = isUnsafeAssignment(
          returnNodeType,
          functionReturnType,
          checker,
          returnNode,
        );
        if (!result) {
          return;
        }

        const { sender, receiver } = result;
        return context.report({
          node: reportingNode,
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: checker.typeToString(sender),
            receiver: checker.typeToString(receiver),
          },
        });
      }
    }

    return {
      ReturnStatement(node): void {
        const argument = node.argument;
        if (!argument) {
          return;
        }

        checkReturn(argument, node);
      },
      'ArrowFunctionExpression > :not(BlockStatement).body': checkReturn,
    };
  },
});
