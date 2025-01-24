import * as eslintUtils from '@eslint-community/eslint-utils';

import type { TSESTree } from '../../ts-estree';

type IsSpecificTokenFunction<SpecificToken extends TSESTree.Token> = (
  token: TSESTree.Token,
) => token is SpecificToken;

type IsNotSpecificTokenFunction<SpecificToken extends TSESTree.Token> = (
  token: TSESTree.Token,
) => token is Exclude<TSESTree.Token, SpecificToken>;

type PunctuatorTokenWithValue<Value extends string> = {
  value: Value;
} & TSESTree.PunctuatorToken;
type IsPunctuatorTokenWithValueFunction<Value extends string> =
  IsSpecificTokenFunction<PunctuatorTokenWithValue<Value>>;
type IsNotPunctuatorTokenWithValueFunction<Value extends string> =
  IsNotSpecificTokenFunction<PunctuatorTokenWithValue<Value>>;

export const isArrowToken =
  eslintUtils.isArrowToken as IsPunctuatorTokenWithValueFunction<'=>'>;
export const isNotArrowToken =
  eslintUtils.isNotArrowToken as IsNotPunctuatorTokenWithValueFunction<'=>'>;

export const isClosingBraceToken =
  eslintUtils.isClosingBraceToken as IsPunctuatorTokenWithValueFunction<'}'>;
export const isNotClosingBraceToken =
  eslintUtils.isNotClosingBraceToken as IsNotPunctuatorTokenWithValueFunction<'}'>;

export const isClosingBracketToken =
  eslintUtils.isClosingBracketToken as IsPunctuatorTokenWithValueFunction<']'>;
export const isNotClosingBracketToken =
  eslintUtils.isNotClosingBracketToken as IsNotPunctuatorTokenWithValueFunction<']'>;

export const isClosingParenToken =
  eslintUtils.isClosingParenToken as IsPunctuatorTokenWithValueFunction<')'>;
export const isNotClosingParenToken =
  eslintUtils.isNotClosingParenToken as IsNotPunctuatorTokenWithValueFunction<')'>;

export const isColonToken =
  eslintUtils.isColonToken as IsPunctuatorTokenWithValueFunction<':'>;
export const isNotColonToken =
  eslintUtils.isNotColonToken as IsNotPunctuatorTokenWithValueFunction<':'>;

export const isCommaToken =
  eslintUtils.isCommaToken as IsPunctuatorTokenWithValueFunction<','>;
export const isNotCommaToken =
  eslintUtils.isNotCommaToken as IsNotPunctuatorTokenWithValueFunction<','>;

export const isCommentToken =
  eslintUtils.isCommentToken as IsSpecificTokenFunction<TSESTree.Comment>;
export const isNotCommentToken =
  eslintUtils.isNotCommentToken as IsNotSpecificTokenFunction<TSESTree.Comment>;

export const isOpeningBraceToken =
  eslintUtils.isOpeningBraceToken as IsPunctuatorTokenWithValueFunction<'{'>;
export const isNotOpeningBraceToken =
  eslintUtils.isNotOpeningBraceToken as IsNotPunctuatorTokenWithValueFunction<'{'>;

export const isOpeningBracketToken =
  eslintUtils.isOpeningBracketToken as IsPunctuatorTokenWithValueFunction<'['>;
export const isNotOpeningBracketToken =
  eslintUtils.isNotOpeningBracketToken as IsNotPunctuatorTokenWithValueFunction<'['>;

export const isOpeningParenToken =
  eslintUtils.isOpeningParenToken as IsPunctuatorTokenWithValueFunction<'('>;
export const isNotOpeningParenToken =
  eslintUtils.isNotOpeningParenToken as IsNotPunctuatorTokenWithValueFunction<'('>;

export const isSemicolonToken =
  eslintUtils.isSemicolonToken as IsPunctuatorTokenWithValueFunction<';'>;
export const isNotSemicolonToken =
  eslintUtils.isNotSemicolonToken as IsNotPunctuatorTokenWithValueFunction<';'>;
