import rules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';

export const rulesMeta = Object.entries(rules).map(([name, content]) => ({
  name,
  type: content.meta.type,
  docs: content.meta.docs,
  fixable: content.meta.fixable,
  hasSuggestions: content.meta.hasSuggestions,
  deprecated: content.meta.deprecated,
  replacedBy: content.meta.replacedBy,
}));

export type RulesMeta = typeof rulesMeta;
