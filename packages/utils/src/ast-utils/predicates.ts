import type { TSESTree } from '../ts-estree';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '../ts-estree';

import {
  isNodeOfType,
  isNodeOfTypes,
  isNodeOfTypeWithConditions,
  isNotTokenOfTypeWithConditions,
  isTokenOfTypeWithConditions,
} from './helpers';

const isOptionalChainPunctuator = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '?.' },
);

const isNotOptionalChainPunctuator = isNotTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '?.' },
);

const isNonNullAssertionPunctuator = isTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '!' },
);

const isNotNonNullAssertionPunctuator = isNotTokenOfTypeWithConditions(
  AST_TOKEN_TYPES.Punctuator,
  { value: '!' },
);

/**
 * Returns true if and only if the node represents: foo?.() or foo.bar?.()
 */
const isOptionalCallExpression = isNodeOfTypeWithConditions(
  AST_NODE_TYPES.CallExpression,
  // this flag means the call expression itself is option
  // i.e. it is foo.bar?.() and not foo?.bar()
  { optional: true },
);

/**
 * Returns true if and only if the node represents logical OR
 */
const isLogicalOrOperator = isNodeOfTypeWithConditions(
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
const isTypeAssertion = isNodeOfTypes([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSTypeAssertion,
] as const);

const isVariableDeclarator = isNodeOfType(AST_NODE_TYPES.VariableDeclarator);

const functionTypes = [
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
] as const;
const isFunction = isNodeOfTypes(functionTypes);

const functionTypeTypes = [
  AST_NODE_TYPES.TSCallSignatureDeclaration,
  AST_NODE_TYPES.TSConstructorType,
  AST_NODE_TYPES.TSConstructSignatureDeclaration,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSFunctionType,
  AST_NODE_TYPES.TSMethodSignature,
] as const;
const isFunctionType = isNodeOfTypes(functionTypeTypes);

const isFunctionOrFunctionType = isNodeOfTypes([
  ...functionTypes,
  ...functionTypeTypes,
] as const);

const isTSFunctionType = isNodeOfType(AST_NODE_TYPES.TSFunctionType);

const isTSConstructorType = isNodeOfType(AST_NODE_TYPES.TSConstructorType);

const isClassOrTypeElement = isNodeOfTypes([
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
const isConstructor = isNodeOfTypeWithConditions(
  AST_NODE_TYPES.MethodDefinition,
  { kind: 'constructor' },
);

/**
 * Checks if a node is a setter method.
 */
function isSetter(
  node: TSESTree.Node | undefined,
): node is (TSESTree.MethodDefinition | TSESTree.Property) & { kind: 'set' } {
  return (
    !!node &&
    (node.type === AST_NODE_TYPES.MethodDefinition ||
      node.type === AST_NODE_TYPES.Property) &&
    node.kind === 'set'
  );
}

const isIdentifier = isNodeOfType(AST_NODE_TYPES.Identifier);

/**
 * Checks if a node represents an `await …` expression.
 */
const isAwaitExpression = isNodeOfType(AST_NODE_TYPES.AwaitExpression);

/**
 * Checks if a possible token is the `await` keyword.
 */
const isAwaitKeyword = isTokenOfTypeWithConditions(AST_TOKEN_TYPES.Identifier, {
  value: 'await',
});

const isLoop = isNodeOfTypes([
  AST_NODE_TYPES.DoWhileStatement,
  AST_NODE_TYPES.ForStatement,
  AST_NODE_TYPES.ForInStatement,
  AST_NODE_TYPES.ForOfStatement,
  AST_NODE_TYPES.WhileStatement,
] as const);

export {
  isAwaitExpression,
  isAwaitKeyword,
  isConstructor,
  isClassOrTypeElement,
  isFunction,
  isFunctionOrFunctionType,
  isFunctionType,
  isIdentifier,
  isLoop,
  isLogicalOrOperator,
  isNonNullAssertionPunctuator,
  isNotNonNullAssertionPunctuator,
  isNotOptionalChainPunctuator,
  isOptionalChainPunctuator,
  isOptionalCallExpression,
  isSetter,
  isTSConstructorType,
  isTSFunctionType,
  isTypeAssertion,
  isVariableDeclarator,
};
