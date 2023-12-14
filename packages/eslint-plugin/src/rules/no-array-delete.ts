import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

type MessageId = 'noArrayDelete' | 'useSplice';

export default createRule<[], MessageId>({
  name: 'no-array-delete',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Disallow the delete operator with array expressions',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      noArrayDelete:
        'Using the `delete` operator with an array expression is unsafe.',
      useSplice: 'Use `{{ target }}.splice({{ key }}, 1)` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isUnderlyingTypeArray(type: ts.Type): boolean {
      const isArray = (t: ts.Type): boolean => checker.isArrayType(t);

      if (type.isUnion()) {
        return type.types.every(isArray);
      }

      if (type.isIntersection()) {
        return type.types.some(isArray);
      }

      return isArray(type);
    }

    return {
      'UnaryExpression[operator="delete"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        if (node.argument.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const type = services.getTypeAtLocation(node.argument.object);

        if (!isUnderlyingTypeArray(type)) {
          return;
        }

        const shouldHaveParentheses =
          node.argument.property.type === AST_NODE_TYPES.SequenceExpression;

        const nodeMap = services.esTreeNodeToTSNodeMap;
        const target = nodeMap.get(node.argument.object).getText();
        const rawKey = nodeMap.get(node.argument.property).getText();
        const key = shouldHaveParentheses ? `(${rawKey})` : rawKey;

        context.report({
          node,
          messageId: 'noArrayDelete',
          suggest: [
            {
              messageId: 'useSplice',
              data: {
                key,
                target,
              },
              fix(fixer): TSESLint.RuleFix | null {
                return fixer.replaceText(node, `${target}.splice(${key}, 1)`);
              },
            },
          ],
        });
      },
    };
  },
});
