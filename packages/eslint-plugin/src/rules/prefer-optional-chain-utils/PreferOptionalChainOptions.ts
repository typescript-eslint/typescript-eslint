export type PreferOptionalChainMessageIds =
  | 'preferOptionalChain'
  | 'optionalChainSuggest';

export interface PreferOptionalChainOptions {
  checkAny?: boolean;
  checkUnknown?: boolean;
  checkString?: boolean;
  checkNumber?: boolean;
  checkBoolean?: boolean;
  checkBigInt?: boolean;
  requireNullish?: boolean;
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
}
