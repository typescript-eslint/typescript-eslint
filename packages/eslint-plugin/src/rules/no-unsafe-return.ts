import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tools from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';
import { getThisExpression } from '../util';

export default util.createRule({
  name: 'no-unsafe-return',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow returning a value with type `any` from a function',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeReturn: 'Unsafe return of an `{{type}}` typed value.',
      unsafeReturnThis: [
        'Unsafe return of an `{{type}}` typed value. `this` is typed as `any`.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
      unsafeReturnAssignment:
        'Unsafe return of type `{{sender}}` from function with return type `{{receiver}}`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();
    const isNoImplicitThis = tools.isStrictCompilerOptionEnabled(
      compilerOptions,
      'noImplicitThis',
    );

    function getParentFunctionNode(
      node: TSESTree.Node,
    ):
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | null {
      let current = node.parent;
      while (current) {
        if (
          current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          current.type === AST_NODE_TYPES.FunctionDeclaration ||
          current.type === AST_NODE_TYPES.FunctionExpression
        ) {
          return current;
        }

        current = current.parent;
      }

      // this shouldn't happen in correct code, but someone may attempt to parse bad code
      // the parser won't error, so we shouldn't throw here
      /* istanbul ignore next */ return null;
    }

    function checkReturn(
      returnNode: TSESTree.Node,
      reportingNode: TSESTree.Node = returnNode,
    ): void {
      const tsNode = services.esTreeNodeToTSNodeMap.get(returnNode);
      const anyType = util.isAnyOrAnyArrayTypeDiscriminated(tsNode, checker);
      const functionNode = getParentFunctionNode(returnNode);
      /* istanbul ignore if */ if (!functionNode) {
        return;
      }

      // function has an explicit return type, so ensure it's a safe return
      const returnNodeType = util.getConstrainedTypeAtLocation(
        services,
        returnNode,
      );
      const functionTSNode = services.esTreeNodeToTSNodeMap.get(functionNode);

      // function expressions will not have their return type modified based on receiver typing
      // so we have to use the contextual typing in these cases, i.e.
      // const foo1: () => Set<string> = () => new Set<any>();
      // the return type of the arrow function is Set<any> even though the variable is typed as Set<string>
      let functionType =
        ts.isFunctionExpression(functionTSNode) ||
        ts.isArrowFunction(functionTSNode)
          ? util.getContextualType(checker, functionTSNode)
          : services.getTypeAtLocation(functionNode);
      if (!functionType) {
        functionType = services.getTypeAtLocation(functionNode);
      }

      // If there is an explicit type annotation *and* that type matches the actual
      // function return type, we shouldn't complain (it's intentional, even if unsafe)
      if (functionTSNode.type) {
        for (const signature of functionType.getCallSignatures()) {
          if (returnNodeType === signature.getReturnType()) {
            return;
          }
        }
      }

      if (anyType !== util.AnyType.Safe) {
        // Allow cases when the declared return type of the function is either unknown or unknown[]
        // and the function is returning any or any[].
        for (const signature of functionType.getCallSignatures()) {
          const functionReturnType = signature.getReturnType();
          if (
            anyType === util.AnyType.Any &&
            util.isTypeUnknownType(functionReturnType)
          ) {
            return;
          }
          if (
            anyType === util.AnyType.AnyArray &&
            util.isTypeUnknownArrayType(functionReturnType, checker)
          ) {
            return;
          }
        }

        let messageId: 'unsafeReturn' | 'unsafeReturnThis' = 'unsafeReturn';

        if (!isNoImplicitThis) {
          // `return this`
          const thisExpression = getThisExpression(returnNode);
          if (
            thisExpression &&
            util.isTypeAnyType(
              util.getConstrainedTypeAtLocation(services, thisExpression),
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
            type: anyType === util.AnyType.Any ? 'any' : 'any[]',
          },
        });
      }

      for (const signature of functionType.getCallSignatures()) {
        const functionReturnType = signature.getReturnType();
        const result = util.isUnsafeAssignment(
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
