import type {
  ClassicConfig,
  FlatConfig,
} from '@typescript-eslint/utils/ts-eslint';

import type rules from './rules';

declare const cjsExport: {
  configs: {
    [configName: string]: ClassicConfig.Config;
    [flatConfigName: `flat/${string}`]:
      | FlatConfig.Config
      | FlatConfig.ConfigArray;
  };
  meta: FlatConfig.PluginMeta;
  rules: typeof rules;
};
export = cjsExport;
