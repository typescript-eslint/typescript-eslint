import { AST_NODE_TYPES, AST_TOKEN_TYPES, TSESTree } from '../ts-estree';

const isNodeOfType =
  <NodeType extends AST_NODE_TYPES>(nodeType: NodeType) =>
  (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeType } =>
    node?.type === nodeType;
const isNodeOfTypes =
  <NodeTypes extends readonly AST_NODE_TYPES[]>(nodeTypes: NodeTypes) =>
  (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeTypes[number] } =>
    !!node && nodeTypes.includes(node.type);

type ObjectEntry<BaseType> = [keyof BaseType, BaseType[keyof BaseType]];
type ObjectEntries<BaseType> = Array<ObjectEntry<BaseType>>;
const isNodeOfTypeWithConditions = <
  NodeType extends AST_NODE_TYPES,
  Conditions extends Partial<TSESTree.Node & { type: NodeType }>,
>(
  nodeType: NodeType,
  conditions: Conditions,
): ((
  node: TSESTree.Node | null | undefined,
) => node is TSESTree.Node & { type: NodeType } & Conditions) => {
  const entries = Object.entries(conditions) as ObjectEntries<
    TSESTree.Node & { type: NodeType }
  >;

  return (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeType } & Conditions =>
    node?.type === nodeType &&
    entries.every(([key, value]) => node[key] === value);
};

function isOptionalChainPunctuator(
  token: TSESTree.Token,
): token is TSESTree.PunctuatorToken & { value: '?.' } {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
function isNotOptionalChainPunctuator(
  token: TSESTree.Token,
): token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: '?.' }
> {
  return !isOptionalChainPunctuator(token);
}

function isNonNullAssertionPunctuator(
  token: TSESTree.Token,
): token is TSESTree.PunctuatorToken & { value: '!' } {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '!';
}
function isNotNonNullAssertionPunctuator(
  token: TSESTree.Token,
): token is Exclude<TSESTree.Token, TSESTree.PunctuatorToken & { value: '!' }> {
  return !isNonNullAssertionPunctuator(token);
}

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
function isTypeAssertion(
  node: TSESTree.Node | undefined | null,
): node is TSESTree.TSAsExpression | TSESTree.TSTypeAssertion {
  if (!node) {
    return false;
  }
  return (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion
  );
}

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
  AST_NODE_TYPES.ClassProperty,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.MethodDefinition,
  AST_NODE_TYPES.TSAbstractClassProperty,
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
function isAwaitKeyword(
  node: TSESTree.Token | undefined | null,
): node is TSESTree.IdentifierToken & { value: 'await' } {
  return node?.type === AST_TOKEN_TYPES.Identifier && node.value === 'await';
}

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
