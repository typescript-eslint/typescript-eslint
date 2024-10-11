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
      notLiteral: `Explicit enum value must only be a literal value (string or number).`,
      notLiteralOrBitwiseExpression: `Explicit enum value must only be a literal value (string or number) or a bitwise expression.`,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowBitwiseExpressions: {
            type: 'boolean',
            description:
              'Whether to allow using bitwise expressions in enum initializers.',
          },
        },
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
      return decl.body.members.some(
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

    return {
      TSEnumMember(node): void {
        // If there is no initializer, then this node is just the name of the member, so ignore.
        if (node.initializer == null) {
          return;
        }
        const declaration = node.parent.parent;

        function isAllowedInitializerExpressionRecursive(
          node: TSESTree.Expression | TSESTree.PrivateIdentifier,
          partOfBitwiseComputation: boolean,
        ): boolean {
          // You can only refer to an enum member if it's part of a bitwise computation.
          // so C = B isn't allowed (special case), but C = A | B is.
          if (partOfBitwiseComputation && isSelfEnumMember(declaration, node)) {
            return true;
          }

          switch (node.type) {
            // any old literal
            case AST_NODE_TYPES.Literal:
              return true;

            // TemplateLiteral without expressions
            case AST_NODE_TYPES.TemplateLiteral:
              return node.expressions.length === 0;

            case AST_NODE_TYPES.UnaryExpression:
              // +123, -123, etc.
              if (['-', '+'].includes(node.operator)) {
                return isAllowedInitializerExpressionRecursive(
                  node.argument,
                  partOfBitwiseComputation,
                );
              }

              if (allowBitwiseExpressions) {
                return (
                  node.operator === '~' &&
                  isAllowedInitializerExpressionRecursive(node.argument, true)
                );
              }
              return false;

            case AST_NODE_TYPES.BinaryExpression:
              if (allowBitwiseExpressions) {
                return (
                  ['&', '^', '<<', '>>', '>>>', '|'].includes(node.operator) &&
                  isAllowedInitializerExpressionRecursive(node.left, true) &&
                  isAllowedInitializerExpressionRecursive(node.right, true)
                );
              }
              return false;

            default:
              return false;
          }
        }

        if (isAllowedInitializerExpressionRecursive(node.initializer, false)) {
          return;
        }

        context.report({
          node: node.id,
          messageId: allowBitwiseExpressions
            ? 'notLiteralOrBitwiseExpression'
            : 'notLiteral',
        });
      },
    };
  },
});
