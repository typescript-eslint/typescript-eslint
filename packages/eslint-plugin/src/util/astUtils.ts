import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type NegateGuard<T, U> = T extends U ? T : U;

const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

function isOptionalChainPunctuator(
  token: TSESTree.TokenOrComment,
): token is TSESTree.PunctuatorToken<'?.'> {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
function isNotOptionalChainPunctuator<T extends TSESTree.TokenOrComment>(
  token: T,
): token is NegateGuard<TSESTree.PunctuatorToken<'?.'>, T> {
  return !isOptionalChainPunctuator(token);
}

function isNonNullAssertionPunctuator(
  token: TSESTree.TokenOrComment,
): token is TSESTree.PunctuatorToken<'!'> {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '!';
}
function isNotNonNullAssertionPunctuator<T extends TSESTree.TokenOrComment>(
  token: T,
): token is NegateGuard<TSESTree.PunctuatorToken<'!'>, T> {
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
  left: TSESTree.TokenOrComment,
  right: TSESTree.TokenOrComment,
): boolean {
  return left.loc.end.line === right.loc.start.line;
}

/**
 * Checks if a node is a type assertion:
 * - x as foo
 * - <foo>x
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

export {
  isTypeAssertion,
  isNonNullAssertionPunctuator,
  isNotNonNullAssertionPunctuator,
  isNotOptionalChainPunctuator,
  isOptionalChainPunctuator,
  isOptionalOptionalChain,
  isTokenOnSameLine,
  isLogicalOrOperator,
  LINEBREAK_MATCHER,
};
