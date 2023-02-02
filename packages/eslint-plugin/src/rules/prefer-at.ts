import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export default util.createRule({
  name: 'prefer-at',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce the use of `array.at(-1)` instead of `array[array.length - 1]`',
      recommended: false,
    },
    messages: {
      preferAt:
        'Expected a `{{name}}.at(-1)` instead of `{{name}}[{{name}}.length - 1]`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    class UnknownNodeError extends Error {
      public constructor(node: TSESTree.Node) {
        super(`UnknownNode ${node.type}`);
      }
    }

    function getName(node: TSESTree.Node): string {
      switch (node.type) {
        case AST_NODE_TYPES.PrivateIdentifier:
          return `#${node.name}`;
        case AST_NODE_TYPES.Identifier:
          return node.name;
        case AST_NODE_TYPES.ThisExpression:
          return 'this';
        case AST_NODE_TYPES.MemberExpression:
          return `${getName(node.object)}.${getName(node.property)}`;
        default:
          throw new UnknownNodeError(node);
      }
    }

    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        try {
          if (
            node.property.type !== AST_NODE_TYPES.BinaryExpression ||
            node.property.operator !== '-' ||
            node.property.right.type !== AST_NODE_TYPES.Literal ||
            node.property.right.value !== 1
          ) {
            return;
          }
          const objectName = getName(node.object);
          const propertyLeftName = getName(node.property.left);
          if (`${objectName}.length` === propertyLeftName) {
            context.report({
              messageId: 'preferAt',
              data: {
                name: objectName,
              },
              node,
              fix: fixer => fixer.replaceText(node, `${objectName}.at(-1)`),
            });
          }
        } catch (error) {
          if (error instanceof UnknownNodeError) {
            return;
          }
          throw error;
        }
      },
    };
  },
});
