import * as eslintUtils from 'eslint-utils';
import { TSESTree } from '../../ts-estree';

type IsPunctuatorTokenWithValueFunction<Value extends string> = (
  token: TSESTree.Token,
) => token is TSESTree.PunctuatorToken & { value: Value };

const isArrowToken =
  eslintUtils.isArrowToken as IsPunctuatorTokenWithValueFunction<'=>'>;
const isNotArrowToken = eslintUtils.isNotArrowToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: '=>' }
>;

const isClosingBraceToken =
  eslintUtils.isClosingBraceToken as IsPunctuatorTokenWithValueFunction<'}'>;
const isNotClosingBraceToken = eslintUtils.isNotClosingBraceToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: '}' }
>;

const isClosingBracketToken =
  eslintUtils.isClosingBracketToken as IsPunctuatorTokenWithValueFunction<']'>;
const isNotClosingBracketToken = eslintUtils.isNotClosingBracketToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: ']' }
>;

const isClosingParenToken =
  eslintUtils.isClosingParenToken as IsPunctuatorTokenWithValueFunction<')'>;
const isNotClosingParenToken = eslintUtils.isNotClosingParenToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: ')' }
>;

const isColonToken =
  eslintUtils.isColonToken as IsPunctuatorTokenWithValueFunction<':'>;
const isNotColonToken = eslintUtils.isNotColonToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: ':' }
>;

const isCommaToken =
  eslintUtils.isCommaToken as IsPunctuatorTokenWithValueFunction<','>;
const isNotCommaToken = eslintUtils.isNotCommaToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: ',' }
>;

const isCommentToken = eslintUtils.isCommentToken as (
  token: TSESTree.Token,
) => token is TSESTree.Comment;
const isNotCommentToken = eslintUtils.isNotCommentToken as (
  token: TSESTree.Token,
) => token is Exclude<TSESTree.Token, TSESTree.Comment>;

const isOpeningBraceToken =
  eslintUtils.isOpeningBraceToken as IsPunctuatorTokenWithValueFunction<'{'>;
const isNotOpeningBraceToken = eslintUtils.isNotOpeningBraceToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: '{' }
>;

const isOpeningBracketToken =
  eslintUtils.isOpeningBracketToken as IsPunctuatorTokenWithValueFunction<'['>;
const isNotOpeningBracketToken = eslintUtils.isNotOpeningBracketToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: '[' }
>;

const isOpeningParenToken =
  eslintUtils.isOpeningParenToken as IsPunctuatorTokenWithValueFunction<'('>;
const isNotOpeningParenToken = eslintUtils.isNotOpeningParenToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: '(' }
>;

const isSemicolonToken =
  eslintUtils.isSemicolonToken as IsPunctuatorTokenWithValueFunction<';'>;
const isNotSemicolonToken = eslintUtils.isNotSemicolonToken as (
  token: TSESTree.Token,
) => token is Exclude<
  TSESTree.Token,
  TSESTree.PunctuatorToken & { value: ';' }
>;

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
