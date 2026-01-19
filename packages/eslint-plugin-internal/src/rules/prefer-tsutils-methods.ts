import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util/index.js';

type FlagType = 'ObjectFlags' | 'SymbolFlags' | 'TypeFlags';

interface FlagConfig {
  flagsProperty: string;
  method: string;
}

const FLAG_CONFIGS: Record<FlagType, FlagConfig> = {
  ObjectFlags: {
    flagsProperty: 'objectFlags',
    method: 'isObjectFlagSet',
  },
  SymbolFlags: {
    flagsProperty: 'flags',
    method: 'isSymbolFlagSet',
  },
  TypeFlags: {
    flagsProperty: 'flags',
    method: 'isTypeFlagSet',
  },
};

export default createRule({
  name: 'prefer-tsutils-methods',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce using ts-api-utils methods over direct bitwise flag checks',
    },
    fixable: 'code',
    messages: {
      preferMethod:
        'Prefer tsutils.{{ method }}() over bitwise {{ flagType }} check',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    /**
     * Check if a node is a member expression accessing ts.XFlags.Y
     */
    function isTsFlagAccess(
      node: TSESTree.Node,
    ): { flagType: FlagType; fullText: string } | null {
      // ts.TypeFlags.X or ts.SymbolFlags.X or ts.ObjectFlags.X
      if (
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.object.type === AST_NODE_TYPES.MemberExpression &&
        node.object.object.type === AST_NODE_TYPES.Identifier &&
        node.object.object.name === 'ts' &&
        node.object.property.type === AST_NODE_TYPES.Identifier
      ) {
        const flagType = node.object.property.name;
        if (
          flagType === 'TypeFlags' ||
          flagType === 'SymbolFlags' ||
          flagType === 'ObjectFlags'
        ) {
          return {
            flagType,
            fullText: context.sourceCode.getText(node),
          };
        }
      }
      return null;
    }

    /**
     * Check if a node is a parenthesized expression containing OR of flags
     * (ts.TypeFlags.X | ts.TypeFlags.Y)
     */
    function isFlagOrExpression(
      node: TSESTree.Node,
    ): { flagType: FlagType; fullText: string } | null {
      if (
        node.type === AST_NODE_TYPES.BinaryExpression &&
        node.operator === '|'
      ) {
        const leftFlag = isTsFlagAccess(node.left);
        if (leftFlag) {
          return {
            flagType: leftFlag.flagType,
            fullText: context.sourceCode.getText(node),
          };
        }
        const leftOr = isFlagOrExpression(node.left);
        if (leftOr) {
          return {
            flagType: leftOr.flagType,
            fullText: context.sourceCode.getText(node),
          };
        }
      }
      return null;
    }

    /**
     * Check if a node is a flag property access like type.flags or type.objectFlags
     * The expectedFlagType is used to disambiguate when the property name is 'flags'
     * (which is shared by TypeFlags and SymbolFlags)
     */
    function isFlagPropertyAccess(
      node: TSESTree.Node,
      expectedFlagType: FlagType,
    ): { objectText: string } | null {
      if (
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.property.type === AST_NODE_TYPES.Identifier
      ) {
        const propName = node.property.name;
        const expectedPropName = FLAG_CONFIGS[expectedFlagType].flagsProperty;
        if (propName === expectedPropName) {
          return {
            objectText: context.sourceCode.getText(node.object),
          };
        }
      }
      return null;
    }

    /**
     * Analyze a binary expression with & operator
     */
    function analyzeBitwiseAnd(node: TSESTree.BinaryExpression): {
      flagAccess: { flagType: FlagType; flagText: string };
      objectText: string;
    } | null {
      const { left, right } = node;

      // Pattern: obj.flags & ts.TypeFlags.X
      // First check if right side is a flag constant, then verify left matches
      const rightFlag = isTsFlagAccess(right) ?? isFlagOrExpression(right);
      if (rightFlag) {
        const leftPropAccess = isFlagPropertyAccess(left, rightFlag.flagType);
        if (leftPropAccess) {
          return {
            flagAccess: {
              flagText: rightFlag.fullText,
              flagType: rightFlag.flagType,
            },
            objectText: leftPropAccess.objectText,
          };
        }
      }

      // Pattern: ts.TypeFlags.X & obj.flags (reversed)
      const leftFlag = isTsFlagAccess(left) ?? isFlagOrExpression(left);
      if (leftFlag) {
        const rightPropAccess = isFlagPropertyAccess(right, leftFlag.flagType);
        if (rightPropAccess) {
          return {
            flagAccess: {
              flagText: leftFlag.fullText,
              flagType: leftFlag.flagType,
            },
            objectText: rightPropAccess.objectText,
          };
        }
      }

      return null;
    }

    return {
      BinaryExpression(node: TSESTree.BinaryExpression): void {
        // We're looking for bitwise AND
        if (node.operator !== '&') {
          return;
        }

        const analysis = analyzeBitwiseAnd(node);
        if (!analysis) {
          return;
        }

        const { flagAccess, objectText } = analysis;
        const { flagText, flagType } = flagAccess;
        const method = FLAG_CONFIGS[flagType].method;

        // Determine the full expression to replace and whether it's negated
        let nodeToReplace: TSESTree.Node = node;
        let isNegated = false;

        // Check if parent is a comparison with 0: (expr) === 0 or (expr) !== 0
        const parent = node.parent;
        if (
          parent.type === AST_NODE_TYPES.BinaryExpression &&
          (parent.operator === '===' || parent.operator === '!==') &&
          parent.right.type === AST_NODE_TYPES.Literal &&
          parent.right.value === 0
        ) {
          nodeToReplace = parent;
          isNegated = parent.operator === '===';
        }

        const replacement = isNegated
          ? `!tsutils.${method}(${objectText}, ${flagText})`
          : `tsutils.${method}(${objectText}, ${flagText})`;

        context.report({
          node: nodeToReplace,
          messageId: 'preferMethod',
          data: { flagType, method },
          fix: fixer => fixer.replaceText(nodeToReplace, replacement),
        });
      },
    };
  },
});
