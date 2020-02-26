import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

function isOptionalChainPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): token is TSESTree.PunctuatorToken & { value: '?.' } {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
function isNotOptionalChainPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
  return !isOptionalChainPunctuator(token);
}

function isNonNullAssertionPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): token is TSESTree.PunctuatorToken & { value: '!' } {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '!';
}
function isNotNonNullAssertionPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
  return !isNonNullAssertionPunctuator(token);
}

/**
 * Returns true if and only if the node represents: foo?.() or foo.bar?.()
 */
function isOptionalOptionalChain(
  node: TSESTree.Node,
): node is TSESTree.OptionalCallExpression & { optional: true } {
  return (
    node.type === AST_NODE_TYPES.OptionalCallExpression &&
    // this flag means the call expression itself is option
    // i.e. it is foo.bar?.() and not foo?.bar()
    node.optional
  );
}

/**
 * Returns true if and only if the node represents logical OR
 */
function isLogicalOrOperator(
  node: TSESTree.Node,
): node is TSESTree.LogicalExpression & { operator: '||' } {
  return (
    node.type === AST_NODE_TYPES.LogicalExpression && node.operator === '||'
  );
}

/**
 * Determines whether two adjacent tokens are on the same line
 */
function isTokenOnSameLine(
  left: TSESTree.Token | TSESTree.Comment,
  right: TSESTree.Token | TSESTree.Comment,
): boolean {
  return left.loc.end.line === right.loc.start.line;
}

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

function isVariableDeclarator(
  node: TSESTree.Node | undefined,
): node is TSESTree.VariableDeclarator {
  return node?.type === AST_NODE_TYPES.VariableDeclarator;
}

function isFunction(
  node: TSESTree.Node | undefined,
): node is
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression {
  if (!node) {
    return false;
  }

  return [
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.FunctionExpression,
  ].includes(node.type);
}

function isFunctionType(
  node: TSESTree.Node | undefined,
): node is
  | TSESTree.TSCallSignatureDeclaration
  | TSESTree.TSConstructSignatureDeclaration
  | TSESTree.TSEmptyBodyFunctionExpression
  | TSESTree.TSFunctionType
  | TSESTree.TSMethodSignature {
  if (!node) {
    return false;
  }

  return [
    AST_NODE_TYPES.TSCallSignatureDeclaration,
    AST_NODE_TYPES.TSConstructSignatureDeclaration,
    AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
    AST_NODE_TYPES.TSFunctionType,
    AST_NODE_TYPES.TSMethodSignature,
  ].includes(node.type);
}

function isFunctionOrFunctionType(
  node: TSESTree.Node | undefined,
): node is
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.TSCallSignatureDeclaration
  | TSESTree.TSConstructSignatureDeclaration
  | TSESTree.TSEmptyBodyFunctionExpression
  | TSESTree.TSFunctionType
  | TSESTree.TSMethodSignature {
  return isFunction(node) || isFunctionType(node);
}

function isTSFunctionType(
  node: TSESTree.Node | undefined,
): node is TSESTree.TSFunctionType {
  return node?.type === AST_NODE_TYPES.TSFunctionType;
}

function isClassOrTypeElement(
  node: TSESTree.Node | undefined,
): node is TSESTree.ClassElement | TSESTree.TypeElement {
  if (!node) {
    return false;
  }

  return [
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
  ].includes(node.type);
}

/**
 * Checks if a node is a constructor method.
 */
function isConstructor(
  node: TSESTree.Node | undefined,
): node is TSESTree.MethodDefinition {
  return (
    node?.type === AST_NODE_TYPES.MethodDefinition &&
    node.kind === 'constructor'
  );
}

/**
 * Checks if a node is a setter method.
 */
function isSetter(
  node: TSESTree.Node | undefined,
): node is TSESTree.MethodDefinition | TSESTree.Property {
  return (
    !!node &&
    (node.type === AST_NODE_TYPES.MethodDefinition ||
      node.type === AST_NODE_TYPES.Property) &&
    node.kind === 'set'
  );
}

function isIdentifier(
  node: TSESTree.Node | undefined,
): node is TSESTree.Identifier {
  return node?.type === AST_NODE_TYPES.Identifier;
}

/**
 * Checks if a node represents an `await …` expression.
 */
function isAwaitExpression(
  node: TSESTree.Node | undefined | null,
): node is TSESTree.AwaitExpression {
  return node?.type === AST_NODE_TYPES.AwaitExpression;
}

/**
 * Checks if a possible token is the `await` keyword.
 */
function isAwaitKeyword(
  node: TSESTree.Token | TSESTree.Comment | undefined | null,
): node is TSESTree.KeywordToken & { value: 'await' } {
  return node?.type === AST_TOKEN_TYPES.Identifier && node.value === 'await';
}

function isMemberOrOptionalMemberExpression(
  node: TSESTree.Node,
): node is TSESTree.MemberExpression | TSESTree.OptionalMemberExpression {
  return (
    node.type === AST_NODE_TYPES.MemberExpression ||
    node.type === AST_NODE_TYPES.OptionalMemberExpression
  );
}

export {
  isAwaitExpression,
  isAwaitKeyword,
  isConstructor,
  isClassOrTypeElement,
  isFunction,
  isFunctionOrFunctionType,
  isFunctionType,
  isIdentifier,
  isLogicalOrOperator,
  isMemberOrOptionalMemberExpression,
  isNonNullAssertionPunctuator,
  isNotNonNullAssertionPunctuator,
  isNotOptionalChainPunctuator,
  isOptionalChainPunctuator,
  isOptionalOptionalChain,
  isSetter,
  isTokenOnSameLine,
  isTSFunctionType,
  isTypeAssertion,
  isVariableDeclarator,
  LINEBREAK_MATCHER,
};
