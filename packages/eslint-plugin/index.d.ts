import type {
  ClassicConfig,
  FlatConfig,
} from '@typescript-eslint/utils/ts-eslint';
import type rules from './rules';
import type {
  TSRuleOptions
} from './rule.option';

declare const cjsExport: {
  configs: Record<string, ClassicConfig.Config>;
  meta: FlatConfig.PluginMeta;
  rules: typeof rules;
  ruleOptions: TSRuleOptions;
};
export = cjsExport;
