import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
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
      unsafeAssignment:
        'Unsafe asignment of type {{sender}} to a variable of type {{receiver}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    function checkAssignment(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Node,
      reportingNode: TSESTree.Node,
      comparisonType: ComparisonType,
    ): void {
      const receiverType = checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(receiverNode),
      );
      const senderType = checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(senderNode),
      );

      if (util.isTypeAnyType(senderType)) {
        return context.report({
          node: reportingNode,
          messageId: 'anyAssignment',
        });
      }

      if (
        receiverNode.type === AST_NODE_TYPES.ArrayPattern &&
        util.isTypeAnyArrayType(senderType, checker)
      ) {
        return context.report({
          node: reportingNode,
          messageId: 'unsafeArrayPattern',
        });
      }

      if (comparisonType === ComparisonType.None) {
        return;
      }

      const result = util.isUnsafeAssignment(senderType, receiverType, checker);
      if (!result) {
        return;
      }

      const { sender, receiver } = result;
      return context.report({
        node: reportingNode,
        messageId: 'unsafeAssignment',
        data: {
          sender: checker.typeToString(sender),
          receiver: checker.typeToString(receiver),
        },
      });
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
        checkAssignment(
          node.id,
          node.init!,
          node,
          getComparisonType(node.id.typeAnnotation),
        );
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
        checkAssignment(
          node.left,
          node.right,
          node,
          // the variable already has some form of a type to compare against
          ComparisonType.Basic,
        );
      },

      // TODO - { x: 1 }
    };
  },
});
