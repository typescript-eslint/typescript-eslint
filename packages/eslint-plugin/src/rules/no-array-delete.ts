import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
} from '../util';

type MessageId = 'noArrayDelete' | 'useSplice';

export default createRule<[], MessageId>({
  name: 'no-array-delete',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Disallow using the `delete` operator on array values',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      noArrayDelete:
        'Using the `delete` operator with an array expression is unsafe.',
      useSplice: 'Use `array.splice()` instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isUnderlyingTypeArray(type: ts.Type): boolean {
      const predicate = (t: ts.Type): boolean =>
        checker.isArrayType(t) || checker.isTupleType(t);

      if (type.isUnion()) {
        return type.types.every(predicate);
      }

      if (type.isIntersection()) {
        return type.types.some(predicate);
      }

      return predicate(type);
    }

    return {
      'UnaryExpression[operator="delete"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        const { argument } = node;

        if (argument.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const type = getConstrainedTypeAtLocation(services, argument.object);

        if (!isUnderlyingTypeArray(type)) {
          return;
        }

        context.report({
          node,
          messageId: 'noArrayDelete',
          suggest: [
            {
              messageId: 'useSplice',
              fix(fixer): TSESLint.RuleFix | null {
                const { object, property } = argument;

                const shouldHaveParentheses =
                  property.type === AST_NODE_TYPES.SequenceExpression;

                const nodeMap = services.esTreeNodeToTSNodeMap;
                const target = nodeMap.get(object).getText();
                const rawKey = nodeMap.get(property).getText();
                const key = shouldHaveParentheses ? `(${rawKey})` : rawKey;

                return fixer.replaceText(node, `${target}.splice(${key}, 1)`);
              },
            },
          ],
        });
      },
    };
  },
});
