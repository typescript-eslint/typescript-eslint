import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-magic-numbers';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const baseRuleSchema = Array.isArray(baseRule.meta.schema)
  ? baseRule.meta.schema[0]
  : baseRule.meta.schema;

export default util.createRule<Options, MessageIds>({
  name: 'no-magic-numbers',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows magic numbers',
      category: 'Best Practices',
      recommended: false,
    },
    // Extend base schema with additional property to ignore TS numeric literal types
    schema: [
      {
        ...baseRuleSchema,
        properties: {
          ...baseRuleSchema.properties,
          ignoreNumericLiteralTypes: {
            type: 'boolean',
          },
          ignoreEnums: {
            type: 'boolean',
          },
          ignoreReadonlyClassProperties: {
            type: 'boolean',
          },
        },
      },
    ],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      ignore: [],
      ignoreArrayIndexes: false,
      enforceConst: false,
      detectObjects: false,
      ignoreNumericLiteralTypes: false,
      ignoreEnums: false,
      ignoreReadonlyClassProperties: false,
    },
  ],
  create(context, [options]) {
    const rules = baseRule.create(context);

    /**
     * Returns whether the node is number literal
     * @param node the node literal being evaluated
     * @returns true if the node is a number literal
     */
    function isNumber(node: TSESTree.Literal): boolean {
      return typeof node.value === 'number';
    }

    /**
     * Checks if the node grandparent is a Typescript type alias declaration
     * @param node the node to be validated.
     * @returns true if the node grandparent is a Typescript type alias declaration
     * @private
     */
    function isGrandparentTSTypeAliasDeclaration(node: TSESTree.Node): boolean {
      return node.parent && node.parent.parent
        ? node.parent.parent.type === AST_NODE_TYPES.TSTypeAliasDeclaration
        : false;
    }

    /**
     * Checks if the node grandparent is a Typescript union type and its parent is a type alias declaration
     * @param node the node to be validated.
     * @returns true if the node grandparent is a Typescript untion type and its parent is a type alias declaration
     * @private
     */
    function isGrandparentTSUnionType(node: TSESTree.Node): boolean {
      if (
        node.parent &&
        node.parent.parent &&
        node.parent.parent.type === AST_NODE_TYPES.TSUnionType
      ) {
        return isGrandparentTSTypeAliasDeclaration(node.parent);
      }

      return false;
    }

    /**
     * Checks if the node parent is a Typescript enum member
     * @param node the node to be validated.
     * @returns true if the node parent is a Typescript enum member
     * @private
     */
    function isParentTSEnumDeclaration(node: TSESTree.Node): boolean {
      return (
        typeof node.parent !== 'undefined' &&
        node.parent.type === AST_NODE_TYPES.TSEnumMember
      );
    }

    /**
     * Checks if the node parent is a Typescript literal type
     * @param node the node to be validated.
     * @returns true if the node parent is a Typescript literal type
     * @private
     */
    function isParentTSLiteralType(node: TSESTree.Node): boolean {
      return node.parent
        ? node.parent.type === AST_NODE_TYPES.TSLiteralType
        : false;
    }

    /**
     * Checks if the node is a valid TypeScript numeric literal type.
     * @param node the node to be validated.
     * @returns true if the node is a TypeScript numeric literal type.
     * @private
     */
    function isTSNumericLiteralType(node: TSESTree.Node): boolean {
      // For negative numbers, update the parent node
      if (
        node.parent &&
        node.parent.type === AST_NODE_TYPES.UnaryExpression &&
        node.parent.operator === '-'
      ) {
        node = node.parent;
      }

      // If the parent node is not a TSLiteralType, early return
      if (!isParentTSLiteralType(node)) {
        return false;
      }

      // If the grandparent is a TSTypeAliasDeclaration, ignore
      if (isGrandparentTSTypeAliasDeclaration(node)) {
        return true;
      }

      // If the grandparent is a TSUnionType and it's parent is a TSTypeAliasDeclaration, ignore
      if (isGrandparentTSUnionType(node)) {
        return true;
      }

      return false;
    }

    /**
     * Checks if the node parent is a readonly class property
     * @param node the node to be validated.
     * @returns true if the node parent is a readonly class property
     * @private
     */
    function isParentTSReadonlyClassProperty(node: TSESTree.Node): boolean {
      if (
        node.parent &&
        node.parent.type === AST_NODE_TYPES.UnaryExpression &&
        ['-', '+'].includes(node.parent.operator)
      ) {
        node = node.parent;
      }

      if (
        node.parent &&
        node.parent.type === AST_NODE_TYPES.ClassProperty &&
        node.parent.readonly
      ) {
        return true;
      }

      return false;
    }

    return {
      Literal(node): void {
        // Check if the node is a TypeScript enum declaration
        if (options.ignoreEnums && isParentTSEnumDeclaration(node)) {
          return;
        }

        // Check TypeScript specific nodes for Numeric Literal
        if (
          options.ignoreNumericLiteralTypes &&
          isNumber(node) &&
          isTSNumericLiteralType(node)
        ) {
          return;
        }

        // Check if the node is a readonly class property
        if (isNumber(node) && isParentTSReadonlyClassProperty(node)) {
          if (options.ignoreReadonlyClassProperties) {
            return;
          }

          let fullNumberNode:
            | TSESTree.Literal
            | TSESTree.UnaryExpression = node;
          let raw = node.raw;

          if (
            node.parent &&
            node.parent.type === AST_NODE_TYPES.UnaryExpression
          ) {
            fullNumberNode = node.parent;
            raw = `${node.parent.operator}${node.raw}`;
          }

          context.report({
            messageId: 'noMagic',
            node: fullNumberNode,
            data: { raw },
          });

          return;
        }

        // Let the base rule deal with the rest
        rules.Literal(node);
      },
    };
  },
});
