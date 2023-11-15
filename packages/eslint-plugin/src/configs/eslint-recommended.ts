import eslintRecommended_raw from './eslint-recommended-raw';

/**
 * This is a compatibility ruleset that:
 * - disables rules from eslint:recommended which are already handled by TypeScript.
 * - enables rules that make sense due to TS's typechecking / transpilation.
 */
export = {
  overrides: [eslintRecommended_raw('glob')],
};
