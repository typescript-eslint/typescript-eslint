import pluginBase from '@typescript-eslint/eslint-plugin';
import * as parserBase from '@typescript-eslint/parser';
// see the comment in config-helper.ts for why this doesn't use /ts-eslint
import type { TSESLint } from '@typescript-eslint/utils';

import type { ConfigWithExtends } from './config-helper';
import { config } from './config-helper';
import allConfig from './configs/all';
import baseConfig from './configs/base';
import disableTypeCheckedConfig from './configs/disable-type-checked';
import eslintRecommendedConfig from './configs/eslint-recommended';
import recommendedConfig from './configs/recommended';
import recommendedTypeCheckedConfig from './configs/recommended-type-checked';
import recommendedTypeCheckedOnlyConfig from './configs/recommended-type-checked-only';
import strictConfig from './configs/strict';
import strictTypeCheckedConfig from './configs/strict-type-checked';
import strictTypeCheckedOnlyConfig from './configs/strict-type-checked-only';
import stylisticConfig from './configs/stylistic';
import stylisticTypeCheckedConfig from './configs/stylistic-type-checked';
import stylisticTypeCheckedOnlyConfig from './configs/stylistic-type-checked-only';

const parser: TSESLint.FlatConfig.Parser = {
  meta: parserBase.meta,
  parseForESLint: parserBase.parseForESLint,
};

const plugin: TSESLint.FlatConfig.Plugin = {
  meta: pluginBase.meta,
  rules: pluginBase.rules,
};

const configs = {
  all: allConfig(plugin, parser),
  base: baseConfig(plugin, parser),
  disableTypeChecked: disableTypeCheckedConfig(plugin, parser),
  eslintRecommended: eslintRecommendedConfig(plugin, parser),
  recommended: recommendedConfig(plugin, parser),
  recommendedTypeChecked: recommendedTypeCheckedConfig(plugin, parser),
  recommendedTypeCheckedOnly: recommendedTypeCheckedOnlyConfig(plugin, parser),
  strict: strictConfig(plugin, parser),
  strictTypeChecked: strictTypeCheckedConfig(plugin, parser),
  strictTypeCheckedOnly: strictTypeCheckedOnlyConfig(plugin, parser),
  stylistic: stylisticConfig(plugin, parser),
  stylisticTypeChecked: stylisticTypeCheckedConfig(plugin, parser),
  stylisticTypeCheckedOnly: stylisticTypeCheckedOnlyConfig(plugin, parser),
};

export type Config = TSESLint.FlatConfig.ConfigFile;
export type { ConfigWithExtends };
/*
eslint-disable-next-line import/no-default-export --
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
export { config, configs, parser, plugin };
