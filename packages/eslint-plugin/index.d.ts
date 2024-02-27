import type {
  ClassicConfig,
  FlatConfig,
} from '@typescript-eslint/utils/ts-eslint';
import type {
  TSRuleOptions
} from './rule.option';
import type rules from './rules';

declare const cjsExport: {
  configs: Record<string, ClassicConfig.Config>;
  meta: FlatConfig.PluginMeta;
  rules: typeof rules;
  ruleOptions: TSRuleOptions;
};
export = cjsExport;
