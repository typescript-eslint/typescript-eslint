import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule, deepMerge } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-magic-numbers');

type Options = InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

// Extend base schema with additional property to ignore TS numeric literal types
const schema = deepMerge(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- https://github.com/microsoft/TypeScript/issues/17002
  Array.isArray(baseRule.meta.schema)
    ? baseRule.meta.schema[0]
    : baseRule.meta.schema,
  {
    properties: {
      ignoreNumericLiteralTypes: {
        type: 'boolean',
      },
      ignoreEnums: {
        type: 'boolean',
      },
      ignoreReadonlyClassProperties: {
        type: 'boolean',
      },
      ignoreTypeIndexes: {
        type: 'boolean',
      },
    },
  },
) as unknown as JSONSchema4;

export default createRule<Options, MessageIds>({
  name: 'no-magic-numbers',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow magic numbers',
      extendsBaseRule: true,
    },
    schema: [schema],
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
      ignoreTypeIndexes: false,
    },
  ],
  create(context, [options]) {
    const rules = baseRule.create(context);

    const ignored = new Set((options.ignore ?? []).map(normalizeIgnoreValue));

    return {
      Literal(node): void {
        // If it’s not a numeric literal we’re not interested
        if (typeof node.value !== 'number' && typeof node.value !== 'bigint') {
          return;
        }

        // This will be `true` if we’re configured to ignore this case (eg. it’s
        // an enum and `ignoreEnums` is `true`). It will be `false` if we’re not
        // configured to ignore this case. It will remain `undefined` if this is
        // not one of our exception cases, and we’ll fall back to the base rule.
        let isAllowed: boolean | undefined;

        // Check if the node is ignored
        if (ignored.has(normalizeLiteralValue(node))) {
          isAllowed = true;
        }
        // Check if the node is a TypeScript enum declaration
        else if (isParentTSEnumDeclaration(node)) {
          isAllowed = options.ignoreEnums === true;
        }
        // Check TypeScript specific nodes for Numeric Literal
        else if (isTSNumericLiteralType(node)) {
          isAllowed = options.ignoreNumericLiteralTypes === true;
        }
        // Check if the node is a type index
        else if (isAncestorTSIndexedAccessType(node)) {
          isAllowed = options.ignoreTypeIndexes === true;
        }
        // Check if the node is a readonly class property
        else if (isParentTSReadonlyPropertyDefinition(node)) {
          isAllowed = options.ignoreReadonlyClassProperties === true;
        }

        // If we’ve hit a case where the ignore option is true we can return now
        if (isAllowed === true) {
          return;
        }
        // If the ignore option is *not* set we can report it now
        else if (isAllowed === false) {
          let fullNumberNode: TSESTree.Literal | TSESTree.UnaryExpression =
            node;
          let raw = node.raw;

          if (
            node.parent.type === AST_NODE_TYPES.UnaryExpression &&
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
 * Convert the value to bigint if it's a string. Otherwise, return the value as-is.
 * @param value The value to normalize.
 * @returns The normalized value.
 */
function normalizeIgnoreValue(
  value: bigint | number | string,
): bigint | number {
  if (typeof value === 'string') {
    return BigInt(value.slice(0, -1));
  }

  return value;
}

/**
 * Converts the node to its numeric value, handling prefixed numbers (-1 / +1)
 * @param node the node to normalize.
 */
function normalizeLiteralValue(
  node: TSESTree.BigIntLiteral | TSESTree.NumberLiteral,
): bigint | number {
  if (
    node.parent.type === AST_NODE_TYPES.UnaryExpression &&
    ['-', '+'].includes(node.parent.operator)
  ) {
    if (node.parent.operator === '-') {
      return -(node.value ?? BigInt(node.raw));
    }
  }

  return node.value ?? BigInt(node.raw);
}

/**
 * Gets the true parent of the literal, handling prefixed numbers (-1 / +1)
 */
function getLiteralParent(node: TSESTree.Literal): TSESTree.Node | undefined {
  if (
    node.parent.type === AST_NODE_TYPES.UnaryExpression &&
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
function isParentTSReadonlyPropertyDefinition(node: TSESTree.Literal): boolean {
  const parent = getLiteralParent(node);

  if (parent?.type === AST_NODE_TYPES.PropertyDefinition && parent.readonly) {
    return true;
  }

  return false;
}

/**
 * Checks if the node is part of a type indexed access (eg. Foo[4])
 * @param node the node to be validated.
 * @returns true if the node is part of an indexed access
 * @private
 */
function isAncestorTSIndexedAccessType(node: TSESTree.Literal): boolean {
  // Handle unary expressions (eg. -4)
  let ancestor = getLiteralParent(node);

  // Go up another level while we’re part of a type union (eg. 1 | 2) or
  // intersection (eg. 1 & 2)
  while (
    ancestor?.parent?.type === AST_NODE_TYPES.TSUnionType ||
    ancestor?.parent?.type === AST_NODE_TYPES.TSIntersectionType
  ) {
    ancestor = ancestor.parent;
  }

  return ancestor?.parent?.type === AST_NODE_TYPES.TSIndexedAccessType;
}
