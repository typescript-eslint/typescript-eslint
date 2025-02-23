import type { TSESTree } from '../ts-estree';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '../ts-estree';
import {
  isNodeOfType,
  isNodeOfTypes,
  isNodeOfTypeWithConditions,
  isNotTokenOfTypeWithConditions,
  isTokenOfTypeWithConditions,
} from './helpers';

export const isOptionalChainPunctuator = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '?.' },
);

export const isNotOptionalChainPunctuator = isNotTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '?.' },
);

export const isNonNullAssertionPunctuator = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '!' },
);

export const isNotNonNullAssertionPunctuator = isNotTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '!' },
);

/**
 * Returns true if and only if the node represents: foo?.() or foo.bar?.()
 */
export const isOptionalCallExpression = isNodeOfTypeWithConditions(
  AST_NODE_TYPES.CallExpression,
  // this flag means the call expression itself is option
  // i.e. it is foo.bar?.() and not foo?.bar()
  { optional: true },
);

/**
 * Returns true if and only if the node represents logical OR
 */
export const isLogicalOrOperator = isNodeOfTypeWithConditions(
  AST_NODE_TYPES.LogicalExpression,
  { operator: '||' },
);

/**
 * Checks if a node is a type assertion:
 * ```
 * x as foo
 * <foo>x
 * ```
 */
export const isTypeAssertion = isNodeOfTypes([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSTypeAssertion,
] as const);

export const isVariableDeclarator = isNodeOfType(
  AST_NODE_TYPES.VariableDeclarator,
);

const functionTypes = [
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
] as const;
export const isFunction = isNodeOfTypes(functionTypes);

const functionTypeTypes = [
  AST_NODE_TYPES.TSCallSignatureDeclaration,
  AST_NODE_TYPES.TSConstructorType,
  AST_NODE_TYPES.TSConstructSignatureDeclaration,
  AST_NODE_TYPES.TSDeclareFunction,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSFunctionType,
  AST_NODE_TYPES.TSMethodSignature,
] as const;
export const isFunctionType = isNodeOfTypes(functionTypeTypes);

export const isFunctionOrFunctionType = isNodeOfTypes([
  ...functionTypes,
  ...functionTypeTypes,
] as const);

export const isTSFunctionType = isNodeOfType(AST_NODE_TYPES.TSFunctionType);

export const isTSConstructorType = isNodeOfType(
  AST_NODE_TYPES.TSConstructorType,
);

export const isClassOrTypeElement = isNodeOfTypes([
  // ClassElement
  AST_NODE_TYPES.PropertyDefinition,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.MethodDefinition,
  AST_NODE_TYPES.TSAbstractPropertyDefinition,
  AST_NODE_TYPES.TSAbstractMethodDefinition,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSIndexSignature,
  // TypeElement
  AST_NODE_TYPES.TSCallSignatureDeclaration,
  AST_NODE_TYPES.TSConstructSignatureDeclaration,
  // AST_NODE_TYPES.TSIndexSignature,
  AST_NODE_TYPES.TSMethodSignature,
  AST_NODE_TYPES.TSPropertySignature,
] as const);

/**
 * Checks if a node is a constructor method.
 */
export const isConstructor = isNodeOfTypeWithConditions(
  AST_NODE_TYPES.MethodDefinition,
  { kind: 'constructor' },
);

/**
 * Checks if a node is a setter method.
 */
export function isSetter(
  node: TSESTree.Node | undefined,
): node is { kind: 'set' } & (TSESTree.MethodDefinition | TSESTree.Property) {
  return (
    !!node &&
    (node.type === AST_NODE_TYPES.MethodDefinition ||
      node.type === AST_NODE_TYPES.Property) &&
    node.kind === 'set'
  );
}

export const isIdentifier = isNodeOfType(AST_NODE_TYPES.Identifier);

/**
 * Checks if a node represents an `await …` expression.
 */
export const isAwaitExpression = isNodeOfType(AST_NODE_TYPES.AwaitExpression);

/**
 * Checks if a possible token is the `await` keyword.
 */
export const isAwaitKeyword = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Identifier,
  { value: 'await' },
);

/**
 * Checks if a possible token is the `type` keyword.
 */
export const isTypeKeyword = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Identifier,
  { value: 'type' },
);

/**
 * Checks if a possible token is the `import` keyword.
 */
export const isImportKeyword = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Keyword,
  { value: 'import' },
);

export const isLoop = isNodeOfTypes([
  AST_NODE_TYPES.DoWhileStatement,
  AST_NODE_TYPES.ForStatement,
  AST_NODE_TYPES.ForInStatement,
  AST_NODE_TYPES.ForOfStatement,
  AST_NODE_TYPES.WhileStatement,
] as const);
