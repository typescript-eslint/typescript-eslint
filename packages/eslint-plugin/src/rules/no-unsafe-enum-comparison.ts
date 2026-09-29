import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { createRule, getParserServices, getStaticValue } from '../util';
import {
  getEnumKeyForLiteral,
  getEnumLiterals,
  isMismatchedEnumComparisonTypes,
} from './enum-utils/shared';

export default createRule({
  name: 'no-unsafe-enum-comparison',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow comparing an enum value with a non-enum value',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      mismatchedCase:
        'The case statement does not have a shared enum type with the switch predicate.',
      mismatchedCondition:
        'The two values in this comparison do not have a shared enum type.',
      replaceValueWithEnum: 'Replace with an enum value comparison.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    return {
      'BinaryExpression[operator=/^[<>!=]?={0,2}$/]'(
        node: TSESTree.BinaryExpression,
      ): void {
        const leftType = parserServices.getTypeAtLocation(node.left);
        const rightType = parserServices.getTypeAtLocation(node.right);

        if (isMismatchedEnumComparisonTypes(typeChecker, leftType, rightType)) {
          context.report({
            node,
            messageId: 'mismatchedCondition',
            suggest: [
              {
                messageId: 'replaceValueWithEnum',
                fix(fixer): TSESLint.RuleFix | null {
                  // Replace the right side with an enum key if possible:
                  //
                  // ```ts
                  // Fruit.Apple === 'apple'; // Fruit.Apple === Fruit.Apple
                  // ```
                  const leftEnumKey = getEnumKeyForLiteral(
                    getEnumLiterals(leftType),
                    getStaticValue(node.right)?.value,
                  );

                  if (leftEnumKey) {
                    return fixer.replaceText(node.right, leftEnumKey);
                  }

                  // Replace the left side with an enum key if possible:
                  //
                  // ```ts
                  // declare const fruit: Fruit;
                  // 'apple' === Fruit.Apple; // Fruit.Apple === Fruit.Apple
                  // ```
                  const rightEnumKey = getEnumKeyForLiteral(
                    getEnumLiterals(rightType),
                    getStaticValue(node.left)?.value,
                  );

                  if (rightEnumKey) {
                    return fixer.replaceText(node.left, rightEnumKey);
                  }

                  return null;
                },
              },
            ],
          });
        }
      },

      SwitchCase(node): void {
        // Ignore `default` cases.
        if (node.test == null) {
          return;
        }

        const { parent } = node;

        const leftType = parserServices.getTypeAtLocation(parent.discriminant);
        const rightType = parserServices.getTypeAtLocation(node.test);

        if (isMismatchedEnumComparisonTypes(typeChecker, leftType, rightType)) {
          context.report({
            node,
            messageId: 'mismatchedCase',
          });
        }
      },
    };
  },
});
