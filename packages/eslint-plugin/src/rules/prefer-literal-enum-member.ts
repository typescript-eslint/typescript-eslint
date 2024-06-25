import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, getStaticStringValue } from '../util';

export default createRule({
  name: 'prefer-literal-enum-member',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require all enum members to be literal values',
      recommended: 'strict',
      requiresTypeChecking: false,
    },
    messages: {
      notLiteral: `Explicit enum value must only be a literal value (string, number, boolean, etc).`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowBitwiseExpressions: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowBitwiseExpressions: false,
    },
  ],
  create(context, [{ allowBitwiseExpressions }]) {
    function isIdentifierWithName(node: TSESTree.Node, name: string): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === name;
    }

    function hasEnumMember(
      decl: TSESTree.TSEnumDeclaration,
      name: string,
    ): boolean {
      return decl.members.some(
        member =>
          isIdentifierWithName(member.id, name) ||
          (member.id.type === AST_NODE_TYPES.Literal &&
            getStaticStringValue(member.id) === name),
      );
    }

    function isSelfEnumMember(
      decl: TSESTree.TSEnumDeclaration,
      node: TSESTree.Node,
    ): boolean {
      if (node.type === AST_NODE_TYPES.Identifier) {
        return hasEnumMember(decl, node.name);
      }

      if (
        node.type === AST_NODE_TYPES.MemberExpression &&
        isIdentifierWithName(node.object, decl.id.name)
      ) {
        if (node.property.type === AST_NODE_TYPES.Identifier) {
          return hasEnumMember(decl, node.property.name);
        }

        if (node.computed) {
          const propertyName = getStaticStringValue(node.property);
          if (propertyName) {
            return hasEnumMember(decl, propertyName);
          }
        }
      }
      return false;
    }

    function isAllowedBitwiseOperand(
      decl: TSESTree.TSEnumDeclaration,
      node: TSESTree.Node,
    ): boolean {
      return (
        node.type === AST_NODE_TYPES.Literal || isSelfEnumMember(decl, node)
      );
    }

    return {
      TSEnumMember(node): void {
        // If there is no initializer, then this node is just the name of the member, so ignore.
        if (node.initializer == null) {
          return;
        }
        // any old literal
        if (node.initializer.type === AST_NODE_TYPES.Literal) {
          return;
        }
        // TemplateLiteral without expressions
        if (
          node.initializer.type === AST_NODE_TYPES.TemplateLiteral &&
          node.initializer.expressions.length === 0
        ) {
          return;
        }
        const declaration = node.parent as TSESTree.TSEnumDeclaration;

        // -1 and +1
        if (node.initializer.type === AST_NODE_TYPES.UnaryExpression) {
          if (
            node.initializer.argument.type === AST_NODE_TYPES.Literal &&
            ['+', '-'].includes(node.initializer.operator)
          ) {
            return;
          }

          if (
            allowBitwiseExpressions &&
            node.initializer.operator === '~' &&
            isAllowedBitwiseOperand(declaration, node.initializer.argument)
          ) {
            return;
          }
        }
        if (
          node.initializer.type === AST_NODE_TYPES.UnaryExpression &&
          node.initializer.argument.type === AST_NODE_TYPES.Literal &&
          (['+', '-'].includes(node.initializer.operator) ||
            (allowBitwiseExpressions && node.initializer.operator === '~'))
        ) {
          return;
        }

        if (
          allowBitwiseExpressions &&
          node.initializer.type === AST_NODE_TYPES.BinaryExpression &&
          ['|', '&', '^', '<<', '>>', '>>>'].includes(
            node.initializer.operator,
          ) &&
          isAllowedBitwiseOperand(declaration, node.initializer.left) &&
          isAllowedBitwiseOperand(declaration, node.initializer.right)
        ) {
          return;
        }

        context.report({
          node: node.id,
          messageId: 'notLiteral',
        });
      },
    };
  },
});
