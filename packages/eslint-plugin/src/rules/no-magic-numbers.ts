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
      description: 'Disallow magic numbers',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
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
    messages: baseRule.meta.messages ?? {
      useConst: "Number constants declarations must use 'const'.",
      noMagic: 'No magic number: {{raw}}.',
    },
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

    return {
      Literal(node): void {
        // Check if the node is a TypeScript enum declaration
        if (options.ignoreEnums && isParentTSEnumDeclaration(node)) {
          return;
        }

        // Check TypeScript specific nodes for Numeric Literal
        if (
          options.ignoreNumericLiteralTypes &&
          typeof node.value === 'number' &&
          isTSNumericLiteralType(node)
        ) {
          return;
        }

        // Check if the node is a readonly class property
        if (
          typeof node.value === 'number' &&
          isParentTSReadonlyClassProperty(node)
        ) {
          if (options.ignoreReadonlyClassProperties) {
            return;
          }

          let fullNumberNode:
            | TSESTree.Literal
            | TSESTree.UnaryExpression = node;
          let raw = node.raw;

          if (
            node.parent?.type === AST_NODE_TYPES.UnaryExpression &&
            // the base rule only shows the operator for negative numbers
            // https://github.com/eslint/eslint/blob/9dfc8501fb1956c90dc11e6377b4cb38a6bea65d/lib/rules/no-magic-numbers.js#L126
            node.parent.operator === '-'
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

/**
 * Gets the true parent of the literal, handling prefixed numbers (-1 / +1)
 */
function getLiteralParent(node: TSESTree.Literal): TSESTree.Node | undefined {
  if (
    node.parent?.type === AST_NODE_TYPES.UnaryExpression &&
    ['-', '+'].includes(node.parent.operator)
  ) {
    return node.parent.parent;
  }

  return node.parent;
}

/**
 * Checks if the node grandparent is a Typescript type alias declaration
 * @param node the node to be validated.
 * @returns true if the node grandparent is a Typescript type alias declaration
 * @private
 */
function isGrandparentTSTypeAliasDeclaration(node: TSESTree.Node): boolean {
  return node.parent?.parent?.type === AST_NODE_TYPES.TSTypeAliasDeclaration;
}

/**
 * Checks if the node grandparent is a Typescript union type and its parent is a type alias declaration
 * @param node the node to be validated.
 * @returns true if the node grandparent is a Typescript union type and its parent is a type alias declaration
 * @private
 */
function isGrandparentTSUnionType(node: TSESTree.Node): boolean {
  if (node.parent?.parent?.type === AST_NODE_TYPES.TSUnionType) {
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
function isParentTSEnumDeclaration(node: TSESTree.Literal): boolean {
  const parent = getLiteralParent(node);
  return parent?.type === AST_NODE_TYPES.TSEnumMember;
}

/**
 * Checks if the node parent is a Typescript literal type
 * @param node the node to be validated.
 * @returns true if the node parent is a Typescript literal type
 * @private
 */
function isParentTSLiteralType(node: TSESTree.Node): boolean {
  return node.parent?.type === AST_NODE_TYPES.TSLiteralType;
}

/**
 * Checks if the node is a valid TypeScript numeric literal type.
 * @param node the node to be validated.
 * @returns true if the node is a TypeScript numeric literal type.
 * @private
 */
function isTSNumericLiteralType(node: TSESTree.Node): boolean {
  // For negative numbers, use the parent node
  if (
    node.parent?.type === AST_NODE_TYPES.UnaryExpression &&
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
function isParentTSReadonlyClassProperty(node: TSESTree.Literal): boolean {
  const parent = getLiteralParent(node);

  if (parent?.type === AST_NODE_TYPES.ClassProperty && parent.readonly) {
    return true;
  }

  return false;
}
