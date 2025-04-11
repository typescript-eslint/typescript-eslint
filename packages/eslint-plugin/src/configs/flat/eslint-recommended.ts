import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import config from '../eslint-recommended-raw';

/**
 * This is a compatibility ruleset that:
 * - disables rules from eslint:recommended which are already handled by TypeScript.
 * - enables rules that make sense due to TS's typechecking / transpilation.
 * @see {@link https://typescript-eslint.io/users/configs/#eslint-recommended}
 */
export default (
  _plugin: FlatConfig.Plugin,
  _parser: FlatConfig.Parser,
): FlatConfig.Config => ({
  ...config('minimatch'),
  name: 'typescript-eslint/eslint-recommended',
});
