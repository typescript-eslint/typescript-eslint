import rules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';

export const rulesMeta = Object.entries(rules).map(([name, content]) => ({
  deprecated: content.meta.deprecated,
  docs: content.meta.docs,
  fixable: content.meta.fixable,
  hasSuggestions: content.meta.hasSuggestions,
  name,
  type: content.meta.type,
}));

export type RulesMeta = typeof rulesMeta;
