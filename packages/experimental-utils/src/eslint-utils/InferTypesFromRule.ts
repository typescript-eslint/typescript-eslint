import { RuleModule } from '../ts-eslint';

type InferOptionsTypeFromRuleNever<T> = T extends RuleModule<
  never,
  infer TOptions
>
  ? TOptions
  : unknown;
/**
 * Uses type inference to fetch the TOptions type from the given RuleModule
 */
type InferOptionsTypeFromRule<T> = T extends RuleModule<string, infer TOptions>
  ? TOptions
  : InferOptionsTypeFromRuleNever<T>;

/**
 * Uses type inference to fetch the TMessageIds type from the given RuleModule
 */
type InferMessageIdsTypeFromRule<T> = T extends RuleModule<
  infer TMessageIds,
  unknown[]
>
  ? TMessageIds
  : unknown;

export { InferOptionsTypeFromRule, InferMessageIdsTypeFromRule };
