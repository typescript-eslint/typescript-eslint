import type { ESLintPluginRuleModule } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';

import type { Card } from './renderCard';

function getLabels(rule: ESLintPluginRuleModule): string[] {
  const { deprecated, docs, fixable, hasSuggestions } = rule.meta;
  const recommended =
    typeof docs.recommended === 'object'
      ? docs.recommended.recommended === true
        ? 'recommended'
        : 'strict'
      : docs.recommended;

  return [
    recommended,
    docs.requiresTypeChecking && 'type information',
    fixable && 'fixable',
    hasSuggestions && 'suggestions',
    docs.extendsBaseRule && 'extension',
    deprecated && 'deprecated',
  ].filter(label => typeof label === 'string');
}

export function getRuleCard(
  ruleName: string,
  rule: ESLintPluginRuleModule,
): Card {
  return {
    description: rule.meta.docs.description.replaceAll('`', ''),
    labels: getLabels(rule),
    title: ruleName,
  };
}
