import { createRule } from '../util';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type Options = [
  {
    allow?: string[];
  },
];
type MessageIds = 'noConsole';

export default createRule<Options, MessageIds>({
  name: 'no-console',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of specified `console` methods.',
      category: 'Possible Errors',
      recommended: false,
    },
    messages: {
      noConsole: `Calls to '{{methodName}}' are not allowed.`,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: {
            type: 'array',
            items: {
              types: 'string',
            },
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allow: undefined,
    },
  ],
  create(context, [{ allow }]) {
    function isParentMemberExpression(node: TSESTree.Identifier) {
      if (node.parent && node.parent.type === AST_NODE_TYPES.MemberExpression) {
        return true;
      }

      return false;
    }

    function isGrandParentCallExpression(node: TSESTree.Identifier) {
      if (
        node.parent &&
        node.parent.parent &&
        node.parent.parent.type === AST_NODE_TYPES.CallExpression
      ) {
        return true;
      }

      return false;
    }

    // Validate if it is a needed 'console' by checking the node.
    function isConsole(node: TSESTree.Identifier) {
      if (
        node.name === 'console' &&
        isParentMemberExpression(node) &&
        isGrandParentCallExpression(node)
      ) {
        return true;
      }

      return false;
    }

    function generateIsIncludedResult(result: boolean, methodName: string) {
      return { result, methodName };
    }

    function includedInIdentifierType(propertyName: string, allowed: string[]) {
      return allowed.includes(propertyName)
        ? generateIsIncludedResult(true, '')
        : generateIsIncludedResult(false, `console.${propertyName}`);
    }

    function includedInLiteralType(propertyValue: string, allowed: string[]) {
      return allowed.includes(propertyValue)
        ? generateIsIncludedResult(true, '')
        : generateIsIncludedResult(false, `console.${propertyValue}`);
    }

    // Check if console method is allowed from user.
    function isIncludedInOptions(node: TSESTree.Identifier, allowed: string[]) {
      if (
        !node.parent ||
        node.parent.type !== AST_NODE_TYPES.MemberExpression
      ) {
        return generateIsIncludedResult(false, '');
      }

      // When console method is accessed by Dot notation
      // such as `console.log(...)`, `console.warn(...)`, etc.
      if (node.parent.property.type === AST_NODE_TYPES.Identifier) {
        return includedInIdentifierType(node.parent.property.name, allowed);
      }

      // When console method is accessed by Bracket notation
      // such as `console['log'](...)`, `console['warn'](...)`, etc.
      if (
        node.parent.property.type === AST_NODE_TYPES.Literal &&
        typeof node.parent.property.value === 'string'
      ) {
        return includedInLiteralType(node.parent.property.value, allowed);
      }

      return generateIsIncludedResult(false, '');
    }

    const allowed = allow || [];
    return {
      Identifier(node) {
        if (!isConsole(node)) {
          return;
        }

        const { result, methodName } = isIncludedInOptions(node, allowed);
        if (!result) {
          context.report({
            node: node,
            messageId: 'noConsole',
            data: {
              methodName,
            },
          });
        }
      },
    };
  },
});
