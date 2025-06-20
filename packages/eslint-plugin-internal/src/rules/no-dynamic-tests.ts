import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'no-dynamic-tests',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow dynamic syntax in RuleTester test arrays',
    },
    messages: {
      noDynamicTests:
        'Dynamic syntax is not allowed in RuleTester test arrays. Use static values only.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function isRuleTesterCall(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === 'ruleTester' &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        node.callee.property.name === 'run'
      );
    }

    function isDynamicExpression(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.CallExpression:
          return true;
        case AST_NODE_TYPES.SpreadElement:
          return true;
        case AST_NODE_TYPES.Identifier:
          return true;
        case AST_NODE_TYPES.TemplateLiteral:
          return node.expressions.some(expr => isDynamicExpression(expr));
        case AST_NODE_TYPES.BinaryExpression:
          return (
            isDynamicExpression(node.left) || isDynamicExpression(node.right)
          );
        case AST_NODE_TYPES.UnaryExpression:
          return isDynamicExpression(node.argument);
        case AST_NODE_TYPES.ConditionalExpression:
          return (
            isDynamicExpression(node.test) ||
            isDynamicExpression(node.consequent) ||
            isDynamicExpression(node.alternate)
          );
        case AST_NODE_TYPES.LogicalExpression:
          return (
            isDynamicExpression(node.left) || isDynamicExpression(node.right)
          );
        case AST_NODE_TYPES.MemberExpression:
          return (
            isDynamicExpression(node.object) ||
            isDynamicExpression(node.property)
          );
        case AST_NODE_TYPES.ArrayExpression:
          return node.elements.some(
            element => element && isDynamicExpression(element),
          );
        case AST_NODE_TYPES.ObjectExpression:
          return node.properties.some(prop => {
            if (prop.type === AST_NODE_TYPES.SpreadElement) {
              return true;
            }
            return isDynamicExpression(prop.value);
          });
        case AST_NODE_TYPES.Literal:
        default:
          return false;
      }
    }

    return {
      // Check RuleTester.run calls
      CallExpression(node) {
        if (isRuleTesterCall(node)) {
          const testObject = node.arguments[2];
          if (testObject.type === AST_NODE_TYPES.ObjectExpression) {
            for (const prop of testObject.properties) {
              if (
                prop.type === AST_NODE_TYPES.Property &&
                prop.key.type === AST_NODE_TYPES.Identifier &&
                (prop.key.name === 'valid' || prop.key.name === 'invalid') && // Check each element in the array
                prop.value.type === AST_NODE_TYPES.ArrayExpression
              ) {
                prop.value.elements.forEach(element => {
                  if (element && isDynamicExpression(element)) {
                    context.report({
                      node: element,
                      messageId: 'noDynamicTests',
                    });
                  }
                });
              }
            }
          }
        }
      },
    };
  },
});
