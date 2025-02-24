export type PreferOptionalChainMessageIds =
  | 'optionalChainSuggest'
  | 'preferOptionalChain';

export interface PreferOptionalChainOptions {
  ignoreIfStatements?: boolean;
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
  checkAny?: boolean;
  checkBigInt?: boolean;
  checkBoolean?: boolean;
  checkNumber?: boolean;
  checkString?: boolean;
  checkUnknown?: boolean;
  requireNullish?: boolean;
}
