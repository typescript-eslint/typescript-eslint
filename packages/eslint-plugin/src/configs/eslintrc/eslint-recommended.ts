/**
 * This is a compatibility ruleset that:
 * - disables rules from eslint:recommended which are already handled by TypeScript.
 * - enables rules that make sense due to TS's typechecking / transpilation.
 */

import type { ClassicConfig } from '@typescript-eslint/utils/ts-eslint';

import eslintRecommended_raw from './eslint-recommended-raw';

export = {
  overrides: [eslintRecommended_raw('glob')],
} satisfies ClassicConfig.Config;
