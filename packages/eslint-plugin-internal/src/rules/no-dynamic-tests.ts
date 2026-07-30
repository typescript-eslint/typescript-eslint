import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { getRuleTesterCallObject } from '../util/getRuleTesterCallObject.js';
import { createRule } from '../util/index.js';

export default createRule({
  name: 'no-dynamic-tests',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow dynamic syntax in RuleTester test arrays',
    },
    fixable: 'code',
    messages: {
      noDynamicTests:
        'Dynamic syntax is not allowed in RuleTester test arrays. Use static values only.',
      noFormatNotAllowedHere:
        'Dynamic syntax is not allowed in RuleTester test arrays. noFormat is only for the input code, not for other properties.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function reportDynamicElements(
      node: TSESTree.Node,
      fieldStack: string[],
    ): void {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          if (node.name === 'undefined') {
            break;
          }
          context.report({
            node,
            messageId: 'noDynamicTests',
          });
          break;
        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.SpreadElement:
        case AST_NODE_TYPES.BinaryExpression:
        case AST_NODE_TYPES.ConditionalExpression:
        case AST_NODE_TYPES.MemberExpression:
          context.report({
            node,
            messageId: 'noDynamicTests',
          });
          break;
        case AST_NODE_TYPES.TemplateLiteral:
          node.expressions.forEach(expr => {
            reportDynamicElements(expr, fieldStack);
          });
          break;
        case AST_NODE_TYPES.ArrayExpression:
          node.elements.forEach(element => {
            if (element) {
              reportDynamicElements(element, fieldStack);
            }
          });
          break;
        case AST_NODE_TYPES.ObjectExpression:
          node.properties.forEach(prop => {
            if (prop.type === AST_NODE_TYPES.SpreadElement) {
              context.report({
                node: prop,
                messageId: 'noDynamicTests',
              });
            } else {
              // InvalidTestCase extends ValidTestCase
              const keyToValidate = [
                'code',
                'errors',
                'output',
                'suggestions',
                'messageId',
              ];

              if (
                prop.key.type === AST_NODE_TYPES.Identifier &&
                keyToValidate.includes(prop.key.name)
              ) {
                reportDynamicElements(prop.value, [
                  ...fieldStack,
                  prop.key.name,
                ]);
              } else if (
                prop.key.type === AST_NODE_TYPES.Literal &&
                keyToValidate.includes(prop.key.value as string)
              ) {
                reportDynamicElements(prop.value, [
                  ...fieldStack,
                  prop.key.value as string,
                ]);
              }
            }
          });
          break;
        case AST_NODE_TYPES.TaggedTemplateExpression: {
          if (
            node.tag.type === AST_NODE_TYPES.Identifier &&
            node.tag.name === 'noFormat'
          ) {
            // allow noFormat for the 'code' field only (or if a valid test case is using the string shorthand)
            if (
              fieldStack.length === 1 ||
              (fieldStack.length === 2 && fieldStack.at(-1) === 'code')
            ) {
              break;
            }
            context.report({
              node: node.tag,
              messageId: 'noFormatNotAllowedHere',
              fix: fixer => fixer.remove(node.tag),
            });
            break;
          }

          context.report({
            node: node.tag,
            messageId: 'noDynamicTests',
          });
          break;
        }
        case AST_NODE_TYPES.Literal:
        default:
          break;
      }
    }

    return {
      CallExpression(node) {
        const testObject = getRuleTesterCallObject(node);
        if (!testObject) {
          return;
        }

        for (const prop of testObject.properties) {
          const isTestCases =
            prop.type === AST_NODE_TYPES.Property &&
            prop.key.type === AST_NODE_TYPES.Identifier &&
            (prop.key.name === 'valid' || prop.key.name === 'invalid');

          if (isTestCases) {
            const propName = (prop.key as TSESTree.Identifier).name;
            if (prop.value.type === AST_NODE_TYPES.ArrayExpression) {
              prop.value.elements.forEach(element => {
                if (element) {
                  reportDynamicElements(element, [propName]);
                }
              });
            } else {
              context.report({
                node: prop.value,
                messageId: 'noDynamicTests',
              });
            }
          }
        }
      },
    };
  },
});
