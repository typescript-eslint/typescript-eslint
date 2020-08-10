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
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      anyAssignment: 'Unsafe assignment of an any value.',
      unsafeArrayPattern: 'Unsafe array destructuring of an any array value.',
      unsafeArrayPatternFromTuple:
        'Unsafe array destructuring of a tuple element with an any value.',
      unsafeAssignment:
        'Unsafe assignment of type {{sender}} to a variable of type {{receiver}}.',
      unsafeArraySpread: 'Unsafe spread of an any value in an array.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    // returns true if the assignment reported
    function checkArrayDestructureHelper(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Node,
    ): boolean {
      if (receiverNode.type !== AST_NODE_TYPES.ArrayPattern) {
        return false;
      }

      const senderTsNode = esTreeNodeToTSNodeMap.get(senderNode);
      const senderType = checker.getTypeAtLocation(senderTsNode);

      return checkArrayDestructure(receiverNode, senderType, senderTsNode);
    }

    // returns true if the assignment reported
    function checkArrayDestructure(
      receiverNode: TSESTree.ArrayPattern,
      senderType: ts.Type,
      senderNode: ts.Node,
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
          // don't handle rests as they're not a 1:1 assignment
          continue;
        }

        const senderType = tupleElements[receiverIndex] as ts.Type | undefined;
        if (!senderType) {
          continue;
        }

        // check for the any type first so we can handle [[[x]]] = [any]
        if (util.isTypeAnyType(senderType)) {
          context.report({
            node: receiverElement,
            messageId: 'unsafeArrayPatternFromTuple',
          });
          // we want to report on every invalid element in the tuple
          didReport = true;
        } else if (receiverElement.type === AST_NODE_TYPES.ArrayPattern) {
          didReport = checkArrayDestructure(
            receiverElement,
            senderType,
            senderNode,
          );
        } else if (receiverElement.type === AST_NODE_TYPES.ObjectPattern) {
          didReport = checkObjectDestructure(
            receiverElement,
            senderType,
            senderNode,
          );
        }
      }

      return didReport;
    }

    // returns true if the assignment reported
    function checkObjectDestructureHelper(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Node,
    ): boolean {
      if (receiverNode.type !== AST_NODE_TYPES.ObjectPattern) {
        return false;
      }

      const senderTsNode = esTreeNodeToTSNodeMap.get(senderNode);
      const senderType = checker.getTypeAtLocation(senderTsNode);

      return checkObjectDestructure(receiverNode, senderType, senderTsNode);
    }

    // returns true if the assignment reported
    function checkObjectDestructure(
      receiverNode: TSESTree.ObjectPattern,
      senderType: ts.Type,
      senderNode: ts.Node,
    ): boolean {
      const properties = new Map(
        senderType
          .getProperties()
          .map(property => [
            property.getName(),
            checker.getTypeOfSymbolAtLocation(property, senderNode),
          ]),
      );

      let didReport = false;
      for (
        let receiverIndex = 0;
        receiverIndex < receiverNode.properties.length;
        receiverIndex += 1
      ) {
        const receiverProperty = receiverNode.properties[receiverIndex];
        if (receiverProperty.type === AST_NODE_TYPES.RestElement) {
          // don't bother checking rest
          continue;
        }

        let key: string;
        if (receiverProperty.computed === false) {
          key =
            receiverProperty.key.type === AST_NODE_TYPES.Identifier
              ? receiverProperty.key.name
              : String(receiverProperty.key.value);
        } else if (receiverProperty.key.type === AST_NODE_TYPES.Literal) {
          key = String(receiverProperty.key.value);
        } else if (
          receiverProperty.key.type === AST_NODE_TYPES.TemplateLiteral &&
          receiverProperty.key.quasis.length === 1
        ) {
          key = String(receiverProperty.key.quasis[0].value.cooked);
        } else {
          // can't figure out the name, so skip it
          continue;
        }

        const senderType = properties.get(key);
        if (!senderType) {
          continue;
        }

        // check for the any type first so we can handle {x: {y: z}} = {x: any}
        if (util.isTypeAnyType(senderType)) {
          context.report({
            node: receiverProperty.value,
            messageId: 'unsafeArrayPatternFromTuple',
          });
          didReport = true;
        } else if (
          receiverProperty.value.type === AST_NODE_TYPES.ArrayPattern
        ) {
          didReport = checkArrayDestructure(
            receiverProperty.value,
            senderType,
            senderNode,
          );
        } else if (
          receiverProperty.value.type === AST_NODE_TYPES.ObjectPattern
        ) {
          didReport = checkObjectDestructure(
            receiverProperty.value,
            senderType,
            senderNode,
          );
        }
      }

      return didReport;
    }

    // returns true if the assignment reported
    function checkAssignment(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
      comparisonType: ComparisonType,
    ): boolean {
      const receiverTsNode = esTreeNodeToTSNodeMap.get(receiverNode);
      const receiverType =
        comparisonType === ComparisonType.Contextual
          ? util.getContextualType(checker, receiverTsNode as ts.Expression) ??
            checker.getTypeAtLocation(receiverTsNode)
          : checker.getTypeAtLocation(receiverTsNode);
      const senderType = checker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(senderNode),
      );

      if (util.isTypeAnyType(senderType)) {
        // handle cases when we assign any ==> unknown.
        if (util.isTypeUnknownType(receiverType)) {
          return false;
        }

        context.report({
          node: reportingNode,
          messageId: 'anyAssignment',
        });
        return true;
      }

      if (comparisonType === ComparisonType.None) {
        return false;
      }

      const result = util.isUnsafeAssignment(senderType, receiverType, checker);
      if (!result) {
        return false;
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
      return true;
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
        const init = util.nullThrows(
          node.init,
          util.NullThrowsReasons.MissingToken(node.type, 'init'),
        );
        let didReport = checkAssignment(
          node.id,
          init,
          node,
          getComparisonType(node.id.typeAnnotation),
        );

        if (!didReport) {
          didReport = checkArrayDestructureHelper(node.id, init);
        }
        if (!didReport) {
          checkObjectDestructureHelper(node.id, init);
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
        let didReport = checkAssignment(
          node.left,
          node.right,
          node,
          // the variable already has some form of a type to compare against
          ComparisonType.Basic,
        );

        if (!didReport) {
          didReport = checkArrayDestructureHelper(node.left, node.right);
        }
        if (!didReport) {
          checkObjectDestructureHelper(node.left, node.right);
        }
      },
      // object pattern props are checked via assignments
      ':not(ObjectPattern) > Property'(node: TSESTree.Property): void {
        if (
          node.value.type === AST_NODE_TYPES.AssignmentPattern ||
          node.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression
        ) {
          // handled by other selector
          return;
        }

        checkAssignment(node.key, node.value, node, ComparisonType.Contextual);
      },
      'ArrayExpression > SpreadElement'(node: TSESTree.SpreadElement): void {
        const resetNode = esTreeNodeToTSNodeMap.get(node.argument);
        const restType = checker.getTypeAtLocation(resetNode);
        if (
          util.isTypeAnyType(restType) ||
          util.isTypeAnyArrayType(restType, checker)
        ) {
          context.report({
            node: node,
            messageId: 'unsafeArraySpread',
          });
        }
      },
      'JSXAttribute[value != null]'(node: TSESTree.JSXAttribute): void {
        const value = util.nullThrows(
          node.value,
          util.NullThrowsReasons.MissingToken(node.type, 'value'),
        );
        if (
          value.type !== AST_NODE_TYPES.JSXExpressionContainer ||
          value.expression.type === AST_NODE_TYPES.JSXEmptyExpression
        ) {
          return;
        }

        checkAssignment(
          node.name,
          value.expression,
          value.expression,
          ComparisonType.Contextual,
        );
      },
    };
  },
});
