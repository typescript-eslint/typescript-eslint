import * as eslintUtils from 'eslint-utils';
import { TSESTree } from '../../ts-estree';

const isArrowToken = eslintUtils.isArrowToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: '=>' };
const isNotArrowToken = eslintUtils.isNotArrowToken as (
  token: TSESTree.Token,
) => boolean;

const isClosingBraceToken = eslintUtils.isClosingBraceToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: '}' };
const isNotClosingBraceToken = eslintUtils.isNotClosingBraceToken as (
  token: TSESTree.Token,
) => boolean;

const isClosingBracketToken = eslintUtils.isClosingBracketToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: ']' };
const isNotClosingBracketToken = eslintUtils.isNotClosingBracketToken as (
  token: TSESTree.Token,
) => boolean;

const isClosingParenToken = eslintUtils.isClosingParenToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: ')' };
const isNotClosingParenToken = eslintUtils.isNotClosingParenToken as (
  token: TSESTree.Token,
) => boolean;

const isColonToken = eslintUtils.isColonToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: ':' };
const isNotColonToken = eslintUtils.isNotColonToken as (
  token: TSESTree.Token,
) => boolean;

const isCommaToken = eslintUtils.isCommaToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: ',' };
const isNotCommaToken = eslintUtils.isNotCommaToken as (
  token: TSESTree.Token,
) => boolean;

const isCommentToken = eslintUtils.isCommentToken as (
  token: TSESTree.Token,
) => token is TSESTree.Comment;
const isNotCommentToken = eslintUtils.isNotCommentToken as (
  token: TSESTree.Token,
) => token is Exclude<TSESTree.Token, TSESTree.Comment>;

const isOpeningBraceToken = eslintUtils.isOpeningBraceToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: '{' };
const isNotOpeningBraceToken = eslintUtils.isNotOpeningBraceToken as (
  token: TSESTree.Token,
) => boolean;

const isOpeningBracketToken = eslintUtils.isOpeningBracketToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: '[' };
const isNotOpeningBracketToken = eslintUtils.isNotOpeningBracketToken as (
  token: TSESTree.Token,
) => boolean;

const isOpeningParenToken = eslintUtils.isOpeningParenToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: '(' };
const isNotOpeningParenToken = eslintUtils.isNotOpeningParenToken as (
  token: TSESTree.Token,
) => boolean;

const isSemicolonToken = eslintUtils.isSemicolonToken as (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: ';' };
const isNotSemicolonToken = eslintUtils.isNotSemicolonToken as (
  token: TSESTree.Token,
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
