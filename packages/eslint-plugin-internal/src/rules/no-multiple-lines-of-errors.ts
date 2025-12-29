import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util/index.js';
import { isRuleTesterCall } from '../util/isRuleTesterCall.js';

export default createRule({
  name: 'no-multiple-lines-of-errors',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow multiple errors across multiple lines in RuleTester test outputs',
    },
    messages: {
      multipleLines:
        'Prefer writing singular tests rather than asserting for multiple errors across multiple lines in one test.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function getTestCaseLine(element: TSESTree.ObjectExpression) {
      for (const property of element.properties) {
        if (
          property.type === AST_NODE_TYPES.Property &&
          !property.computed &&
          property.key.type === AST_NODE_TYPES.Identifier &&
          property.key.name === 'line' &&
          property.value.type === AST_NODE_TYPES.Literal &&
          typeof property.value.value === 'number'
        ) {
          return property.value.value;
        }
      }

      return undefined;
    }

    function checkInvalidTestCaseErrors(node: TSESTree.ArrayExpression) {
      let seenLine: number | undefined;

      for (const element of node.elements) {
        if (element?.type !== AST_NODE_TYPES.ObjectExpression) {
          continue;
        }

        const line = getTestCaseLine(element);

        if (seenLine == null) {
          seenLine = line;
        } else if (line !== seenLine) {
          context.report({
            node: element,
            messageId: 'multipleLines',
          });
        }
      }
    }

    function checkTestCase(node: TSESTree.ObjectExpression) {
      for (const property of node.properties) {
        if (
          property.type === AST_NODE_TYPES.Property &&
          !property.computed &&
          property.key.type === AST_NODE_TYPES.Identifier &&
          property.value.type === AST_NODE_TYPES.ArrayExpression
        ) {
          checkInvalidTestCaseErrors(property.value);
        }
      }
    }

    return {
      CallExpression(node) {
        if (isRuleTesterCall(node)) {
          const testObject = node.arguments[2];
          if (testObject.type !== AST_NODE_TYPES.ObjectExpression) {
            return;
          }

          for (const property of testObject.properties) {
            if (
              property.type !== AST_NODE_TYPES.Property ||
              property.computed ||
              property.key.type !== AST_NODE_TYPES.Identifier ||
              property.key.name !== 'invalid' ||
              property.value.type !== AST_NODE_TYPES.ArrayExpression
            ) {
              return;
            }

            for (const element of property.value.elements) {
              if (element?.type === AST_NODE_TYPES.ObjectExpression) {
                checkTestCase(element);
              }
            }
          }
        }
      },
    };
  },
});
