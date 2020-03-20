import * as eslintUtils from 'eslint-utils';
import { TSESTree } from '../../ts-estree';

const isArrowToken = eslintUtils.isArrowToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: '=>' };
const isNotArrowToken = eslintUtils.isNotArrowToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isClosingBraceToken = eslintUtils.isClosingBraceToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: '}' };
const isNotClosingBraceToken = eslintUtils.isNotClosingBraceToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isClosingBracketToken = eslintUtils.isClosingBracketToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: ']' };
const isNotClosingBracketToken = eslintUtils.isNotClosingBracketToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isClosingParenToken = eslintUtils.isClosingParenToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: ')' };
const isNotClosingParenToken = eslintUtils.isNotClosingParenToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isColonToken = eslintUtils.isColonToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: ':' };
const isNotColonToken = eslintUtils.isNotColonToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isCommaToken = eslintUtils.isCommaToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: ',' };
const isNotCommaToken = eslintUtils.isNotCommaToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isCommentToken = eslintUtils.isCommentToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.Comment;
const isNotCommentToken = eslintUtils.isNotCommentToken as <
  T extends TSESTree.Token | TSESTree.Comment
>(
  token: T,
) => token is Exclude<T, TSESTree.Comment>;

const isOpeningBraceToken = eslintUtils.isOpeningBraceToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: '{' };
const isNotOpeningBraceToken = eslintUtils.isNotOpeningBraceToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isOpeningBracketToken = eslintUtils.isOpeningBracketToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: '[' };
const isNotOpeningBracketToken = eslintUtils.isNotOpeningBracketToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isOpeningParenToken = eslintUtils.isOpeningParenToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: '(' };
const isNotOpeningParenToken = eslintUtils.isNotOpeningParenToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

const isSemicolonToken = eslintUtils.isSemicolonToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => token is TSESTree.PunctuatorToken & { value: ';' };
const isNotSemicolonToken = eslintUtils.isNotSemicolonToken as (
  token: TSESTree.Token | TSESTree.Comment,
) => boolean;

export {
  isArrowToken,
  isClosingBraceToken,
  isClosingBracketToken,
  isClosingParenToken,
  isColonToken,
  isCommaToken,
  isCommentToken,
  isNotArrowToken,
  isNotClosingBraceToken,
  isNotClosingBracketToken,
  isNotClosingParenToken,
  isNotColonToken,
  isNotCommaToken,
  isNotCommentToken,
  isNotOpeningBraceToken,
  isNotOpeningBracketToken,
  isNotOpeningParenToken,
  isNotSemicolonToken,
  isOpeningBraceToken,
  isOpeningBracketToken,
  isOpeningParenToken,
  isSemicolonToken,
};
