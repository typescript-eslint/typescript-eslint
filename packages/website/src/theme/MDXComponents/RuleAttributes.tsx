import type { RuleMetaDataDocs } from '@site/../utils/dist/ts-eslint/Rule';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import React from 'react';

import type { FeatureProps } from './Feature';
import { Feature } from './Feature';
import styles from './RuleAttributes.module.css';

const recommendations = {
  recommended: ['✅', 'recommended'],
  strict: ['🔒', 'strict'],
  stylistic: ['🎨', 'stylistic'],
};

const getRecommendation = (docs: RuleMetaDataDocs): string[] => {
  const recommendation = recommendations[docs.recommended!];

  return docs.requiresTypeChecking
    ? [recommendation[0], `${recommendation[1]}-type-checked`]
    : recommendation;
};

export function RuleAttributes({ name }: { name: string }): React.ReactNode {
  const rules = useRulesMeta();
  const rule = rules.find(rule => rule.name === name);
  if (!rule?.docs) {
    return null;
  }

  const features: FeatureProps[] = [];

  if (rule.docs.recommended) {
    const [emoji, recommendation] = getRecommendation(rule.docs);
    features.push({
      children: (
        <>
          Extending{' '}
          <a href={`/docs/linting/configs#${recommendation}`} target="_blank">
            <code className={styles.code}>
              "plugin:@typescript-eslint/{recommendation}"
            </code>
          </a>{' '}
          in an{' '}
          <a
            href="https://eslint.org/docs/latest/user-guide/configuring/configuration-files#extending-configuration-files"
            target="_blank"
          >
            ESLint configuration
          </a>{' '}
          enables this rule.
        </>
      ),
      emoji,
    });
  }

  if (rule.fixable) {
    features.push({
      children: (
        <>
          Some problems reported by this rule are automatically fixable by the{' '}
          <a
            href="https://eslint.org/docs/latest/user-guide/command-line-interface#--fix"
            target="_blank"
          >
            <code>--fix</code> ESLint command line option
          </a>
          .
        </>
      ),
      emoji: '🔧',
    });
  }

  if (rule.hasSuggestions) {
    features.push({
      children: (
        <>
          Some problems reported by this rule are manually fixable by editor{' '}
          <a
            href="https://eslint.org/docs/latest/developer-guide/working-with-rules#providing-suggestions"
            target="_blank"
          >
            suggestions
          </a>
          .
        </>
      ),
      emoji: '💡',
    });
  }

  if (rule.docs.requiresTypeChecking) {
    features.push({
      children: (
        <>
          This rule requires{' '}
          <a href="/linting/typed-linting" target="_blank">
            type information
          </a>{' '}
          to run.
        </>
      ),
      emoji: '💭',
    });
  }

  return (
    <div className={styles.features}>
      {features.map(feature => (
        <Feature {...feature} key={feature.emoji} />
      ))}
    </div>
  );
}
