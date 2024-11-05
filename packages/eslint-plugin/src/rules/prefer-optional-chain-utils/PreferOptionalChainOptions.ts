export type PreferOptionalChainMessageIds =
  | 'optionalChainSuggest'
  | 'preferOptionalChain';

export interface PreferOptionalChainOptions {
  allowIfStatements?: boolean;
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
  checkAny?: boolean;
  checkBigInt?: boolean;
  checkBoolean?: boolean;
  checkNumber?: boolean;
  checkString?: boolean;
  checkUnknown?: boolean;
  requireNullish?: boolean;
}
