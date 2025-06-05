export type PreferOptionalChainMessageIds =
  | 'optionalChainSuggest'
  | 'preferOptionalChain';

export interface PreferOptionalChainOptions {
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
  checkAny?: boolean;
  checkBigInt?: boolean;
  checkBoolean?: boolean;
  checkNumber?: boolean;
  checkString?: boolean;
  checkUnknown?: boolean;
  checkVoid?: boolean;
  requireNullish?: boolean;
}
