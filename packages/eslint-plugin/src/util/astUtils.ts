import {
  TSESTree,
  AST_TOKEN_TYPES,
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

export {
  LINEBREAK_MATCHER,
  isNotOptionalChainPunctuator,
  isOptionalChainPunctuator,
};
