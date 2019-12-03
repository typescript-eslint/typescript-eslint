import {
  TSESTree,
  AST_TOKEN_TYPES,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';

const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

function isOptionalChainPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
function isNotOptionalChainPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
  return !isOptionalChainPunctuator(token);
}

function isNonNullAssertionPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
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
): node is TSESTree.OptionalCallExpression {
  return (
    node.type === AST_NODE_TYPES.OptionalCallExpression &&
    // this flag means the call expression itself is option
    // i.e. it is foo.bar?.() and not foo?.bar()
    node.optional
  );
}

export {
  isNonNullAssertionPunctuator,
  isNotNonNullAssertionPunctuator,
  isNotOptionalChainPunctuator,
  isOptionalChainPunctuator,
  isOptionalOptionalChain,
  LINEBREAK_MATCHER,
};
