import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import type rules from './rules';

declare const cjsExport: {
  meta: FlatConfig.PluginMeta;
  rules: typeof rules;
};
export = cjsExport;
