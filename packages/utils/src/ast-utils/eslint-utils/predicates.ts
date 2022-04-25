import * as eslintUtils from 'eslint-utils';
import { TSESTree } from '../../ts-estree';

type IsSpecificTokenFunction<SpecificToken extends TSESTree.Token> = (
  token: TSESTree.Token,
) => token is SpecificToken;

type IsNotSpecificTokenFunction<SpecificToken extends TSESTree.Token> = (
  token: TSESTree.Token,
) => token is Exclude<TSESTree.Token, SpecificToken>;

type PunctuatorTokenWithValue<Value extends string> =
  TSESTree.PunctuatorToken & { value: Value };
type IsPunctuatorTokenWithValueFunction<Value extends string> =
  IsSpecificTokenFunction<PunctuatorTokenWithValue<Value>>;
type IsNotPunctuatorTokenWithValueFunction<Value extends string> =
  IsNotSpecificTokenFunction<PunctuatorTokenWithValue<Value>>;

const isArrowToken =
  eslintUtils.isArrowToken as IsPunctuatorTokenWithValueFunction<'=>'>;
const isNotArrowToken =
  eslintUtils.isNotArrowToken as IsNotPunctuatorTokenWithValueFunction<'=>'>;

const isClosingBraceToken =
  eslintUtils.isClosingBraceToken as IsPunctuatorTokenWithValueFunction<'}'>;
const isNotClosingBraceToken =
  eslintUtils.isNotClosingBraceToken as IsNotPunctuatorTokenWithValueFunction<'}'>;

const isClosingBracketToken =
  eslintUtils.isClosingBracketToken as IsPunctuatorTokenWithValueFunction<']'>;
const isNotClosingBracketToken =
  eslintUtils.isNotClosingBracketToken as IsNotPunctuatorTokenWithValueFunction<']'>;

const isClosingParenToken =
  eslintUtils.isClosingParenToken as IsPunctuatorTokenWithValueFunction<')'>;
const isNotClosingParenToken =
  eslintUtils.isNotClosingParenToken as IsNotPunctuatorTokenWithValueFunction<')'>;

const isColonToken =
  eslintUtils.isColonToken as IsPunctuatorTokenWithValueFunction<':'>;
const isNotColonToken =
  eslintUtils.isNotColonToken as IsNotPunctuatorTokenWithValueFunction<':'>;

const isCommaToken =
  eslintUtils.isCommaToken as IsPunctuatorTokenWithValueFunction<','>;
const isNotCommaToken =
  eslintUtils.isNotCommaToken as IsNotPunctuatorTokenWithValueFunction<','>;

const isCommentToken =
  eslintUtils.isCommentToken as IsSpecificTokenFunction<TSESTree.Comment>;
const isNotCommentToken =
  eslintUtils.isNotCommentToken as IsNotSpecificTokenFunction<TSESTree.Comment>;

const isOpeningBraceToken =
  eslintUtils.isOpeningBraceToken as IsPunctuatorTokenWithValueFunction<'{'>;
const isNotOpeningBraceToken =
  eslintUtils.isNotOpeningBraceToken as IsNotPunctuatorTokenWithValueFunction<'{'>;

const isOpeningBracketToken =
  eslintUtils.isOpeningBracketToken as IsPunctuatorTokenWithValueFunction<'['>;
const isNotOpeningBracketToken =
  eslintUtils.isNotOpeningBracketToken as IsNotPunctuatorTokenWithValueFunction<'['>;

const isOpeningParenToken =
  eslintUtils.isOpeningParenToken as IsPunctuatorTokenWithValueFunction<'('>;
const isNotOpeningParenToken =
  eslintUtils.isNotOpeningParenToken as IsNotPunctuatorTokenWithValueFunction<'('>;

const isSemicolonToken =
  eslintUtils.isSemicolonToken as IsPunctuatorTokenWithValueFunction<';'>;
const isNotSemicolonToken =
  eslintUtils.isNotSemicolonToken as IsNotPunctuatorTokenWithValueFunction<';'>;

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
