import type { InvalidTestCase } from '@typescript-eslint/rule-tester';
import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util/index.js';

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

    function reportDynamicElements(node: TSESTree.Node): void {
      switch (node.type) {
        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.SpreadElement:
        case AST_NODE_TYPES.Identifier:
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
            reportDynamicElements(expr);
          });
          break;
        case AST_NODE_TYPES.ArrayExpression:
          node.elements.forEach(element => {
            if (element) {
              reportDynamicElements(element);
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
              type TestCaseKey = keyof InvalidTestCase<string, []>;
              const keyToValidate: TestCaseKey[] = ['code', 'errors'];

              if (
                prop.key.type === AST_NODE_TYPES.Identifier &&
                keyToValidate.includes(prop.key.name as TestCaseKey)
              ) {
                reportDynamicElements(prop.value);
              } else if (
                prop.key.type === AST_NODE_TYPES.Literal &&
                keyToValidate.includes(prop.key.value as TestCaseKey)
              ) {
                reportDynamicElements(prop.value);
              }
            }
          });
          break;
        case AST_NODE_TYPES.TaggedTemplateExpression:
          if (
            !(
              node.tag.type === AST_NODE_TYPES.Identifier &&
              node.tag.name === 'noFormat'
            )
          ) {
            context.report({
              node: node.tag,
              messageId: 'noDynamicTests',
            });
          }
          break;
        case AST_NODE_TYPES.Literal:
        default:
          break;
      }
    }

    return {
      CallExpression(node) {
        if (isRuleTesterCall(node)) {
          // If valid code, arg length is always 3 but we need to avoid conflict while dev
          if (node.arguments.length < 3) {
            return;
          }
          const testObject = node.arguments[2];

          if (testObject.type === AST_NODE_TYPES.ObjectExpression) {
            for (const prop of testObject.properties) {
              const isTestCases =
                prop.type === AST_NODE_TYPES.Property &&
                prop.key.type === AST_NODE_TYPES.Identifier &&
                (prop.key.name === 'valid' || prop.key.name === 'invalid');

              if (isTestCases) {
                if (prop.value.type === AST_NODE_TYPES.ArrayExpression) {
                  prop.value.elements.forEach(element => {
                    if (element) {
                      reportDynamicElements(element);
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
          }
        }
      },
    };
  },
});
