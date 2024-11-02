import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

type Options = [];
export type MessageIds = 'unusedPrivateClassMember';

interface PrivateMember {
  declaredNode:
    | TSESTree.MethodDefinitionComputedName
    | TSESTree.MethodDefinitionNonComputedName
    | TSESTree.PropertyDefinitionComputedName
    | TSESTree.PropertyDefinitionNonComputedName;
  isAccessor: boolean;
}

export default createRule<Options, MessageIds>({
  name: 'no-unused-private-class-members',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused private class members',
      extendsBaseRule: true,
      requiresTypeChecking: false,
    },

    schema: [],

    messages: {
      unusedPrivateClassMember:
        "'{{classMemberName}}' is defined but never used.",
    },
  },
  defaultOptions: [],
  create(context) {
    const trackedClasses: Map<string, PrivateMember>[] = [];

    /**
     * The core ESLint rule tracks methods by adding an extra property of
     * "isUsed" to the method, which obviously violates type safety. Instead, in
     * our extended rule, we create a separate data structure to track whether a
     * method is being used.
     */
    const trackedMembersBeingUsed = new Set<
      | TSESTree.MethodDefinitionComputedName
      | TSESTree.MethodDefinitionNonComputedName
      | TSESTree.PropertyDefinitionComputedName
      | TSESTree.PropertyDefinitionNonComputedName
    >();

    /**
     * Check whether the current node is in a write only assignment.
     * @param privateIdentifierNode Node referring to a private identifier
     * @returns Whether the node is in a write only assignment
     * @private
     */
    function isWriteOnlyAssignment(
      privateIdentifierNode: TSESTree.PrivateIdentifier,
    ): boolean {
      const parentStatement = privateIdentifierNode.parent.parent;
      if (parentStatement === undefined) {
        return false;
      }

      const isAssignmentExpression =
        parentStatement.type === AST_NODE_TYPES.AssignmentExpression;

      if (
        !isAssignmentExpression &&
        parentStatement.type !== AST_NODE_TYPES.ForInStatement &&
        parentStatement.type !== AST_NODE_TYPES.ForOfStatement &&
        parentStatement.type !== AST_NODE_TYPES.AssignmentPattern
      ) {
        return false;
      }

      // It is a write-only usage, since we still allow usages on the right for
      // reads.
      if (parentStatement.left !== privateIdentifierNode.parent) {
        return false;
      }

      // For any other operator (such as '+=') we still consider it a read
      // operation.
      if (isAssignmentExpression && parentStatement.operator !== '=') {
        // However, if the read operation is "discarded" in an empty statement,
        // then we consider it write only.
        return (
          parentStatement.parent.type === AST_NODE_TYPES.ExpressionStatement
        );
      }

      return true;
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    function processPrivateIdentifier(
      privateIdentifierNode: TSESTree.PrivateIdentifier,
    ): void {
      const classBody = trackedClasses.find(classProperties =>
        classProperties.has(privateIdentifierNode.name),
      );

      // Can't happen, as it is a parser error to have a missing class body, but
      // let's code defensively here.
      if (classBody === undefined) {
        return;
      }

      // In case any other usage was already detected, we can short circuit the
      // logic here.
      const memberDefinition = classBody.get(privateIdentifierNode.name);
      if (memberDefinition === undefined) {
        return;
      }
      if (trackedMembersBeingUsed.has(memberDefinition.declaredNode)) {
        return;
      }

      // The definition of the class member itself
      if (
        privateIdentifierNode.parent.type ===
          AST_NODE_TYPES.PropertyDefinition ||
        privateIdentifierNode.parent.type === AST_NODE_TYPES.MethodDefinition
      ) {
        return;
      }

      // Any usage of an accessor is considered a read, as the getter/setter can
      // have side-effects in its definition.
      if (memberDefinition.isAccessor) {
        trackedMembersBeingUsed.add(memberDefinition.declaredNode);
        return;
      }

      // Any assignments to this member, except for assignments that also read
      if (isWriteOnlyAssignment(privateIdentifierNode)) {
        return;
      }

      const wrappingExpressionType = privateIdentifierNode.parent.parent?.type;
      const parentOfWrappingExpressionType =
        privateIdentifierNode.parent.parent?.parent?.type;

      // A statement which only increments (`this.#x++;`)
      if (
        wrappingExpressionType === AST_NODE_TYPES.UpdateExpression &&
        parentOfWrappingExpressionType === AST_NODE_TYPES.ExpressionStatement
      ) {
        return;
      }

      /*
       * ({ x: this.#usedInDestructuring } = bar);
       *
       * But should treat the following as a read:
       * ({ [this.#x]: a } = foo);
       */
      if (
        wrappingExpressionType === AST_NODE_TYPES.Property &&
        parentOfWrappingExpressionType === AST_NODE_TYPES.ObjectPattern &&
        privateIdentifierNode.parent.parent?.value ===
          privateIdentifierNode.parent
      ) {
        return;
      }

      // [...this.#unusedInRestPattern] = bar;
      if (wrappingExpressionType === AST_NODE_TYPES.RestElement) {
        return;
      }

      // [this.#unusedInAssignmentPattern] = bar;
      if (wrappingExpressionType === AST_NODE_TYPES.ArrayPattern) {
        return;
      }

      // We can't delete the memberDefinition, as we need to keep track of which
      // member we are marking as used. In the case of nested classes, we only
      // mark the first member we encounter as used. If you were to delete the
      // member, then any subsequent usage could incorrectly mark the member of
      // an encapsulating parent class as used, which is incorrect.
      trackedMembersBeingUsed.add(memberDefinition.declaredNode);
    }

    return {
      // Collect all declared members up front and assume they are all unused
      ClassBody(classBodyNode): void {
        const privateMembers = new Map<string, PrivateMember>();

        trackedClasses.unshift(privateMembers);
        for (const bodyMember of classBodyNode.body) {
          if (
            (bodyMember.type === AST_NODE_TYPES.PropertyDefinition ||
              bodyMember.type === AST_NODE_TYPES.MethodDefinition) &&
            bodyMember.key.type === AST_NODE_TYPES.PrivateIdentifier
          ) {
            privateMembers.set(bodyMember.key.name, {
              declaredNode: bodyMember,
              isAccessor:
                bodyMember.type === AST_NODE_TYPES.MethodDefinition &&
                (bodyMember.kind === 'set' || bodyMember.kind === 'get'),
            });
          }
        }
      },

      /*
       * Process all usages of the private identifier and remove a member from
       * `declaredAndUnusedPrivateMembers` if we deem it used.
       */
      // Bug: We have to manually specify the type for the node or it will be
      // inferred to `never` for some reason.
      // https://github.com/typescript-eslint/typescript-eslint/issues/9988
      PrivateIdentifier(
        privateIdentifierNode: TSESTree.PrivateIdentifier,
      ): void {
        processPrivateIdentifier(privateIdentifierNode);
      },

      /**
       * We need to repeat the logic from the `PrivateIdentitier` block above
       */
      PropertyDefinition(node): void {
        if (node.accessibility !== 'private') {
          return;
        }
      },

      /*
       * Post-process the class members and report any remaining members.
       * Since private members can only be accessed in the current class
       * context, we can safely assume that all usages are within the current
       * class body.
       */
      'ClassBody:exit'(): void {
        const unusedPrivateMembers = trackedClasses.shift();
        if (unusedPrivateMembers === undefined) {
          return;
        }

        for (const [
          classMemberName,
          { declaredNode },
        ] of unusedPrivateMembers.entries()) {
          if (trackedMembersBeingUsed.has(declaredNode)) {
            continue;
          }
          context.report({
            node: declaredNode,
            loc: declaredNode.key.loc,
            messageId: 'unusedPrivateClassMember',
            data: {
              classMemberName: `#${classMemberName}`,
            },
          });
        }
      },
    };
  },
});
