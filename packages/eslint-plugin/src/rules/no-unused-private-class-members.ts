// The following code is adapted from the code in eslint/eslint.
// Source: https://github.com/eslint/eslint/blob/522d8a32f326c52886c531f43cf6a1ff15af8286/lib/rules/no-unused-private-class-members.js
// License: https://github.com/eslint/eslint/blob/522d8a32f326c52886c531f43cf6a1ff15af8286/LICENSE

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

    messages: {
      unusedPrivateClassMember:
        "'{{classMemberName}}' is defined but never used.",
    },

    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const trackedClassMembers: Map<string, PrivateMember>[] = [];

    /**
     * The core ESLint rule tracks methods by adding an extra property of
     * "isUsed" to the method, which is a bug according to Joshua Goldberg.
     * Instead, in our extended rule, we create a separate data structure to
     * track whether a method is being used.
     */
    const trackedClassMembersUsed = new Set<
      | TSESTree.MethodDefinitionComputedName
      | TSESTree.MethodDefinitionNonComputedName
      | TSESTree.PropertyDefinitionComputedName
      | TSESTree.PropertyDefinitionNonComputedName
    >();

    /**
     * Check whether the current node is in a write only assignment.
     * @param node Node referring to a private identifier
     * @returns Whether the node is in a write only assignment
     * @private
     */
    function isWriteOnlyAssignment(
      node: TSESTree.Identifier | TSESTree.PrivateIdentifier,
    ): boolean {
      const parentStatement = node.parent.parent;
      if (parentStatement == null) {
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
      if (parentStatement.left !== node.parent) {
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
      node: TSESTree.Identifier | TSESTree.PrivateIdentifier,
    ): void {
      const classBody = trackedClassMembers.find(classProperties =>
        classProperties.has(node.name),
      );

      // Can't happen, as it is a parser error to have a missing class body, but
      // let's code defensively here.
      if (classBody == null) {
        return;
      }

      // In case any other usage was already detected, we can short circuit the
      // logic here.
      const memberDefinition = classBody.get(node.name);
      if (memberDefinition == null) {
        return;
      }
      if (trackedClassMembersUsed.has(memberDefinition.declaredNode)) {
        return;
      }

      // The definition of the class member itself
      if (
        node.parent.type === AST_NODE_TYPES.PropertyDefinition ||
        node.parent.type === AST_NODE_TYPES.MethodDefinition
      ) {
        return;
      }

      // Any usage of an accessor is considered a read, as the getter/setter can
      // have side-effects in its definition.
      if (memberDefinition.isAccessor) {
        trackedClassMembersUsed.add(memberDefinition.declaredNode);
        return;
      }

      // Any assignments to this member, except for assignments that also read
      if (isWriteOnlyAssignment(node)) {
        return;
      }

      const wrappingExpressionType = node.parent.parent?.type;
      const parentOfWrappingExpressionType = node.parent.parent?.parent?.type;

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
        node.parent.parent?.value === node.parent
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
      trackedClassMembersUsed.add(memberDefinition.declaredNode);
    }

    return {
      // Collect all declared members/methods up front and assume they are all
      // unused.
      ClassBody(classBodyNode): void {
        const privateMembers = new Map<string, PrivateMember>();

        trackedClassMembers.unshift(privateMembers);
        for (const bodyMember of classBodyNode.body) {
          if (
            (bodyMember.type === AST_NODE_TYPES.PropertyDefinition ||
              bodyMember.type === AST_NODE_TYPES.MethodDefinition) &&
            (bodyMember.key.type === AST_NODE_TYPES.PrivateIdentifier ||
              (bodyMember.key.type === AST_NODE_TYPES.Identifier &&
                bodyMember.accessibility === 'private'))
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

      // Process nodes like:
      // ```ts
      // class A {
      //   #myPrivateMember = 123;
      // }
      // ```
      PrivateIdentifier(node): void {
        processPrivateIdentifier(node);
      },

      // Process nodes like:
      // ```ts
      // class A {
      //   private myPrivateMember = 123;
      // }
      // ```
      PropertyDefinition(node): void {
        if (
          node.accessibility === 'private' &&
          node.key.type === AST_NODE_TYPES.Identifier
        ) {
          processPrivateIdentifier(node.key);
        }
      },

      // Post-process the class members and report any remaining members. Since
      // private members can only be accessed in the current class context, we
      // can safely assume that all usages are within the current class body.
      'ClassBody:exit'(): void {
        const unusedPrivateMembers = trackedClassMembers.shift();
        if (unusedPrivateMembers == null) {
          return;
        }

        for (const [
          classMemberName,
          { declaredNode },
        ] of unusedPrivateMembers.entries()) {
          if (trackedClassMembersUsed.has(declaredNode)) {
            continue;
          }
          context.report({
            loc: declaredNode.key.loc,
            node: declaredNode,
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
