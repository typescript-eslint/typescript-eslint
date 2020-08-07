import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { isExpression } from 'tsutils';
import * as util from '../util';

export default util.createRule({
  name: 'no-unsafe-return',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows returning any from a function',
      category: 'Possible Errors',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeReturn: 'Unsafe return of an {{type}} typed value',
      unsafeReturnAssignment:
        'Unsafe return of type {{sender}} from function with return type {{receiver}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

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
      const tsNode = esTreeNodeToTSNodeMap.get(returnNode);
      const anyType = util.isAnyOrAnyArrayTypeDiscriminated(tsNode, checker);
      const functionNode = getParentFunctionNode(returnNode);
      /* istanbul ignore if */ if (!functionNode) {
        return;
      }

      // function has an explicit return type, so ensure it's a safe return
      const returnNodeType = util.getConstrainedTypeAtLocation(
        checker,
        esTreeNodeToTSNodeMap.get(returnNode),
      );
      const functionTSNode = esTreeNodeToTSNodeMap.get(functionNode);

      // function expressions will not have their return type modified based on receiver typing
      // so we have to use the contextual typing in these cases, i.e.
      // const foo1: () => Set<string> = () => new Set<any>();
      // the return type of the arrow function is Set<any> even though the variable is typed as Set<string>
      let functionType = isExpression(functionTSNode)
        ? util.getContextualType(checker, functionTSNode)
        : checker.getTypeAtLocation(functionTSNode);
      if (!functionType) {
        functionType = checker.getTypeAtLocation(functionTSNode);
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

        // If the function return type was not unknown/unknown[], mark usage as unsafeReturn.
        return context.report({
          node: reportingNode,
          messageId: 'unsafeReturn',
          data: {
            type: anyType === util.AnyType.Any ? 'any' : 'any[]',
          },
        });
      }

      for (const signature of functionType.getCallSignatures()) {
        const functionReturnType = signature.getReturnType();
        if (returnNodeType === functionReturnType) {
          // don't bother checking if they're the same
          // either the function is explicitly declared to return the same type
          // or there was no declaration, so the return type is implicit
          return;
        }

        const result = util.isUnsafeAssignment(
          returnNodeType,
          functionReturnType,
          checker,
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
