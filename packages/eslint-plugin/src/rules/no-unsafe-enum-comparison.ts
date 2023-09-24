import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';
import { getEnumTypes } from './enum-utils/shared';

/**
 * @returns Whether the right type is an unsafe comparison against any left type.
 */
function typeViolates(leftTypeParts: ts.Type[], right: ts.Type): boolean {
  const leftValueKinds = new Set(leftTypeParts.map(getEnumValueType));

  return (
    (leftValueKinds.has(ts.TypeFlags.Number) &&
      tsutils.isTypeFlagSet(
        right,
        ts.TypeFlags.Number | ts.TypeFlags.NumberLike,
      )) ||
    (leftValueKinds.has(ts.TypeFlags.String) &&
      tsutils.isTypeFlagSet(
        right,
        ts.TypeFlags.String | ts.TypeFlags.StringLike,
      ))
  );
}

function getEnumKeyForLiteral(
  leftEnumTypes: ts.Type[],
  rightNode: TSESTree.Node,
): string | null {
  const right = util.getStaticValue(rightNode);

  if (right === null) {
    return null;
  }

  for (const leftEnumType of leftEnumTypes) {
    if (leftEnumType.value === right.value) {
      const enumParentName = leftEnumType.symbol.parent.name;

      return `${enumParentName}.${leftEnumType.symbol.name}`;
    }
  }

  return null;
}

/**
 * @returns What type a type's enum value is (number or string), if either.
 */
function getEnumValueType(type: ts.Type): ts.TypeFlags | undefined {
  return util.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
    ? util.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral)
      ? ts.TypeFlags.Number
      : ts.TypeFlags.String
    : undefined;
}

export default util.createRule({
  name: 'no-unsafe-enum-comparison',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow comparing an enum value with a non-enum value',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      mismatched:
        'The two values in this comparison do not have a shared enum type.',
      mismatchedSimilar:
        'The two values in this comparison do not have a shared enum type. Did you mean to compare to `{{replacement}}`?',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    return {
      'BinaryExpression[operator=/^[<>!=]?={0,2}$/]'(
        node: TSESTree.BinaryExpression,
      ): void {
        const left = parserServices.getTypeAtLocation(node.left);
        const right = parserServices.getTypeAtLocation(node.right);

        // Allow comparisons that don't have anything to do with enums:
        //
        // ```ts
        // 1 === 2;
        // ```
        const leftEnumTypes = getEnumTypes(typeChecker, left);
        const rightEnumTypes = new Set(getEnumTypes(typeChecker, right));
        if (leftEnumTypes.length === 0 && rightEnumTypes.size === 0) {
          return;
        }

        // Allow comparisons that share an enum type:
        //
        // ```ts
        // Fruit.Apple === Fruit.Banana;
        // ```
        for (const leftEnumType of leftEnumTypes) {
          if (rightEnumTypes.has(leftEnumType)) {
            return;
          }
        }

        const leftTypeParts = tsutils.unionTypeParts(left);
        const rightTypeParts = tsutils.unionTypeParts(right);

        // If a type exists in both sides, we consider this comparison safe:
        //
        // ```ts
        // declare const fruit: Fruit.Apple | 0;
        // fruit === 0;
        // ```
        for (const leftTypePart of leftTypeParts) {
          if (rightTypeParts.includes(leftTypePart)) {
            return;
          }
        }

        if (typeViolates(leftTypeParts, right)) {
          const leftEnumKey = getEnumKeyForLiteral(leftEnumTypes, node.right);

          if (leftEnumKey) {
            // TODO: Add fixer.
            return context.report({
              messageId: 'mismatchedSimilar',
              node,
              data: {
                replacement: leftEnumKey,
              },
            });
          }

          return context.report({
            messageId: 'mismatched',
            node,
          });
        }

        if (typeViolates(rightTypeParts, left)) {
          const rightEnumKey = getEnumKeyForLiteral(
            [...rightEnumTypes.values()],
            node.left,
          );

          if (rightEnumKey) {
            // TODO: Add fixer.
            return context.report({
              messageId: 'mismatchedSimilar',
              node,
              data: {
                replacement: rightEnumKey,
              },
            });
          }

          return context.report({
            messageId: 'mismatched',
            node,
          });
        }
      },
    };
  },
});
