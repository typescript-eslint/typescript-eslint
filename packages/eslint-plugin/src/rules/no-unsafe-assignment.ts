import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

const enum ComparisonType {
  /** Do no assignment comparison */
  None,
  /** Use the receiver's type for comparison */
  Basic,
  /** Use the sender's contextual type for comparison */
  Contextual,
}

export default util.createRule({
  name: 'no-unsafe-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows assigning any to variables and properties',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      anyAssignment: 'Unsafe assignment of an any value',
      unsafeArrayPattern: 'Unsafe array destructuring of an any array value',
      unsafeArrayPatternFromTuple:
        'Unsafe array destructuring of a tuple element with an any value',
      unsafeAssignment:
        'Unsafe asignment of type {{sender}} to a variable of type {{receiver}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    function checkArrayDestructureHelper(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Node,
    ): boolean {
      if (receiverNode.type !== AST_NODE_TYPES.ArrayPattern) {
        return true;
      }

      const senderType = checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(senderNode),
      );

      return checkArrayDestructure(receiverNode, senderType);
    }

    // returns true if the assignment is safe
    function checkArrayDestructure(
      receiverNode: TSESTree.ArrayPattern,
      senderType: ts.Type,
    ): boolean {
      // any array
      // const [x] = ([] as any[]);
      if (util.isTypeAnyArrayType(senderType, checker)) {
        context.report({
          node: receiverNode,
          messageId: 'unsafeArrayPattern',
        });
        return false;
      }

      if (!checker.isTupleType(senderType)) {
        return true;
      }

      const tupleElements = util.getTypeArguments(senderType, checker);

      // tuple with any
      // const [x] = [1 as any];
      let didReport = false;
      for (
        let receiverIndex = 0;
        receiverIndex < receiverNode.elements.length;
        receiverIndex += 1
      ) {
        const receiverElement = receiverNode.elements[receiverIndex];
        if (!receiverElement) {
          continue;
        }

        if (receiverElement.type === AST_NODE_TYPES.RestElement) {
          // const [...x] = [1, 2, 3 as any];
          // check the remaining elements to see if one of them is typed as any
          for (
            let senderIndex = receiverIndex;
            senderIndex < tupleElements.length;
            senderIndex += 1
          ) {
            const senderType = tupleElements[senderIndex];
            if (senderType && util.isTypeAnyType(senderType)) {
              context.report({
                node: receiverElement,
                messageId: 'unsafeArrayPatternFromTuple',
              });
              return false;
            }
          }
          // rest element must be the last one in a destructure
          return true;
        }

        const senderType = tupleElements[receiverIndex];
        if (receiverElement.type === AST_NODE_TYPES.ArrayPattern) {
          didReport = checkArrayDestructure(receiverElement, senderType);
        } else {
          if (senderType && util.isTypeAnyType(senderType)) {
            context.report({
              node: receiverElement,
              messageId: 'unsafeArrayPatternFromTuple',
            });
            // we want to report on every invalid element in the tuple
            didReport = true;
          }
        }
      }

      return didReport;
    }

    // returns true if the assignment is safe
    function checkAssignment(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Node,
      reportingNode: TSESTree.Node,
      comparisonType: ComparisonType,
    ): boolean {
      const receiverType = checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(receiverNode),
      );
      const senderType = checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(senderNode),
      );

      if (util.isTypeAnyType(senderType)) {
        context.report({
          node: reportingNode,
          messageId: 'anyAssignment',
        });
        return false;
      }

      if (comparisonType === ComparisonType.None) {
        return true;
      }

      const result = util.isUnsafeAssignment(senderType, receiverType, checker);
      if (!result) {
        return true;
      }

      const { sender, receiver } = result;
      context.report({
        node: reportingNode,
        messageId: 'unsafeAssignment',
        data: {
          sender: checker.typeToString(sender),
          receiver: checker.typeToString(receiver),
        },
      });
      return false;
    }

    function getComparisonType(
      typeAnnotation: TSESTree.TSTypeAnnotation | undefined,
    ): ComparisonType {
      return typeAnnotation
        ? // if there's a type annotation, we can do a comparison
          ComparisonType.Basic
        : // no type annotation means the variable's type will just be inferred, thus equal
          ComparisonType.None;
    }

    return {
      'VariableDeclarator[init != null]'(
        node: TSESTree.VariableDeclarator,
      ): void {
        const isSafe = checkAssignment(
          node.id,
          node.init!,
          node,
          getComparisonType(node.id.typeAnnotation),
        );

        if (isSafe) {
          checkArrayDestructureHelper(node.id, node.init!);
        }
      },
      'ClassProperty[value != null]'(node: TSESTree.ClassProperty): void {
        checkAssignment(
          node.key,
          node.value!,
          node,
          getComparisonType(node.typeAnnotation),
        );
      },
      'AssignmentExpression[operator = "="], AssignmentPattern'(
        node: TSESTree.AssignmentExpression | TSESTree.AssignmentPattern,
      ): void {
        const isSafe = checkAssignment(
          node.left,
          node.right,
          node,
          // the variable already has some form of a type to compare against
          ComparisonType.Basic,
        );

        if (isSafe) {
          checkArrayDestructureHelper(node.left, node.right);
        }
      },
      // Property(node): void {
      //   checkAssignment(
      //     node.key,
      //     node.value,
      //     node,
      //     ComparisonType.Contextual, // TODO - is this required???
      //   );
      // },
      // 'JSXAttribute[value != null]'(node: TSESTree.JSXAttribute): void {
      //   if (!node.value) {
      //     return;
      //   }
      //   checkAssignment(
      //     node.name,
      //     node.value,
      //     node,
      //     ComparisonType.Basic, // TODO
      //   );
      // },
    };
  },
});
