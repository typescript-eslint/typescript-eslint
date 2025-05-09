import type * as eslintConfigHelpers from '@eslint/config-helpers';

// see the comment in config-helper.ts for why this doesn't use /ts-eslint
import type { TSESLint } from '@typescript-eslint/utils';

import pluginBase from '@typescript-eslint/eslint-plugin';
import rawPlugin from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/raw-plugin';

import { config } from './config-helper';

// Couldn't find a way to directly get to the eslint Linter.Parser type...
// We don't want to get it directly from eslint, since the supported eslint versions include eslint 8.x as well.
// '@eslint/config-helpers' doesn't re-export the Linter namespace, just some of its contents.
// So this is a bit yucky but it should get the type we want.
type ESLintParserType = NonNullable<
  NonNullable<eslintConfigHelpers.Config['languageOptions']>['parser']
>;

export const parser = rawPlugin.parser as ESLintParserType;

/*
we could build a plugin object here without the `configs` key - but if we do
that then we create a situation in which
```
require('typescript-eslint').plugin !== require('@typescript-eslint/eslint-plugin')
```

This is bad because it means that 3rd party configs would be required to use
`typescript-eslint` or else they would break a user's config if the user either
used `tseslint.configs.recomended` et al or
```
{
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
}
```

This might be something we could consider okay (eg 3rd party flat configs must
use our new package); however legacy configs consumed via `@eslint/eslintrc`
would never be able to satisfy this constraint and thus users would be blocked
from using them.
*/
export const plugin = pluginBase as unknown as eslintConfigHelpers.Plugin;

export const configs = {
  /**
   * Enables each the rules provided as a part of typescript-eslint. Note that many rules are not applicable in all codebases, or are meant to be configured.
   * @see {@link https://typescript-eslint.io/users/configs#all}
   */
  all: rawPlugin.flatConfigs['flat/all'],

  /**
   * A minimal ruleset that sets only the required parser and plugin options needed to run typescript-eslint.
   * We don't recommend using this directly; instead, extend from an earlier recommended rule.
   * @see {@link https://typescript-eslint.io/users/configs#base}
   */
  base: rawPlugin.flatConfigs['flat/base'],

  /**
   * A utility ruleset that will disable type-aware linting and all type-aware rules available in our project.
   * @see {@link https://typescript-eslint.io/users/configs#disable-type-checked}
   */
  disableTypeChecked: rawPlugin.flatConfigs['flat/disable-type-checked'],

  /**
   * This is a compatibility ruleset that:
   * - disables rules from eslint:recommended which are already handled by TypeScript.
   * - enables rules that make sense due to TS's typechecking / transpilation.
   * @see {@link https://typescript-eslint.io/users/configs/#eslint-recommended}
   */
  eslintRecommended: rawPlugin.flatConfigs['flat/eslint-recommended'],

  /**
   * Recommended rules for code correctness that you can drop in without additional configuration.
   * @see {@link https://typescript-eslint.io/users/configs#recommended}
   */
  recommended: rawPlugin.flatConfigs['flat/recommended'],

  /**
   * Contains all of `recommended` along with additional recommended rules that require type information.
   * @see {@link https://typescript-eslint.io/users/configs#recommended-type-checked}
   */
  recommendedTypeChecked:
    rawPlugin.flatConfigs['flat/recommended-type-checked'],

  /**
   * A version of `recommended` that only contains type-checked rules and disables of any corresponding core ESLint rules.
   * @see {@link https://typescript-eslint.io/users/configs#recommended-type-checked-only}
   */
  recommendedTypeCheckedOnly:
    rawPlugin.flatConfigs['flat/recommended-type-checked-only'],

  /**
   * Contains all of `recommended`, as well as additional strict rules that can also catch bugs.
   * @see {@link https://typescript-eslint.io/users/configs#strict}
   */
  strict: rawPlugin.flatConfigs['flat/strict'],

  /**
   * Contains all of `recommended`, `recommended-type-checked`, and `strict`, along with additional strict rules that require type information.
   * @see {@link https://typescript-eslint.io/users/configs#strict-type-checked}
   */
  strictTypeChecked: rawPlugin.flatConfigs['flat/strict-type-checked'],

  /**
   * A version of `strict` that only contains type-checked rules and disables of any corresponding core ESLint rules.
   * @see {@link https://typescript-eslint.io/users/configs#strict-type-checked-only}
   */
  strictTypeCheckedOnly: rawPlugin.flatConfigs['flat/strict-type-checked-only'],

  /**
   * Rules considered to be best practice for modern TypeScript codebases, but that do not impact program logic.
   * @see {@link https://typescript-eslint.io/users/configs#stylistic}
   */
  stylistic: rawPlugin.flatConfigs['flat/stylistic'],

  /**
   * Contains all of `stylistic`, along with additional stylistic rules that require type information.
   * @see {@link https://typescript-eslint.io/users/configs#stylistic-type-checked}
   */
  stylisticTypeChecked: rawPlugin.flatConfigs['flat/stylistic-type-checked'],

  /**
   * A version of `stylistic` that only contains type-checked rules and disables of any corresponding core ESLint rules.
   * @see {@link https://typescript-eslint.io/users/configs#stylistic-type-checked-only}
   */
  stylisticTypeCheckedOnly:
    rawPlugin.flatConfigs['flat/stylistic-type-checked-only'],
} satisfies Record<
  string,
  eslintConfigHelpers.Config | eslintConfigHelpers.Config[]
>;

/**
 * The expected shape of the default export of an eslint flat config file.
 *
 * @deprecated ESLint core provides their own config types, and we now recommend using them instead.
 * @see {@link https://github.com/typescript-eslint/typescript-eslint/issues/10899}
 * @see {@link https://github.com/eslint/eslint/pull/19487}
 */
export type Config = TSESLint.FlatConfig.ConfigFile;

/*
we do both a default and named exports to allow people to use this package from
both CJS and ESM in very natural ways.

EG it means that all of the following are valid:

```ts
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
);
```
```ts
import { config, parser, plugin } from 'typescript-eslint';

export default config(
  {
    languageOptions: { parser }
    plugins: { ts: plugin },
  }
);
```
```ts
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  ...tseslint.configs.recommended,
);
```
```ts
const { config, parser, plugin } = require('typescript-eslint');

module.exports = config(
  {
    languageOptions: { parser }
    plugins: { ts: plugin },
  }
);
```
*/
export default {
  config,
  configs,
  parser,
  plugin,
};

export {
  config,
  type ConfigWithExtends,
  type InfiniteDepthConfigWithExtends,
  type ConfigArray,
} from './config-helper';
