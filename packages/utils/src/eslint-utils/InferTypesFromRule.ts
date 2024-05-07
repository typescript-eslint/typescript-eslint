import type { RuleModule } from '../ts-eslint';

/**
 * Uses type inference to fetch the Options type from the given RuleModule
 */
type InferOptionsTypeFromRule<T> =
  T extends RuleModule<infer _MessageIds, infer Options> ? Options : unknown;

/**
 * Uses type inference to fetch the MessageIds type from the given RuleModule
 */
type InferMessageIdsTypeFromRule<T> =
  T extends RuleModule<infer MessageIds, infer _TOptions>
    ? MessageIds
    : unknown;

export { InferOptionsTypeFromRule, InferMessageIdsTypeFromRule };
