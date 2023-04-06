import Link from '@docusaurus/Link';
import type { RuleMetaDataDocs } from '@site/../utils/dist/ts-eslint/Rule';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import React from 'react';

import type { FeatureProps } from './Feature';
import { Feature } from './Feature';
import styles from './RuleAttributes.module.css';

const getRecommendation = (docs: RuleMetaDataDocs): [string, string] => {
  return docs.recommended === 'strict'
    ? ['🔒', 'strict']
    : docs.requiresTypeChecking
    ? ['🧠', 'recommended-requiring-type-checking']
    : ['✅', 'recommended'];
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
          <Link to={`/linting/configs#${recommendation}`} target="_blank">
            <code className={styles.code}>
              "plugin:@typescript-eslint/{recommendation}"
            </code>
          </Link>{' '}
          in an{' '}
          <Link href="https://eslint.org/docs/latest/user-guide/configuring/configuration-files#extending-configuration-files">
            ESLint configuration
          </Link>{' '}
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
          <Link href="https://eslint.org/docs/latest/user-guide/command-line-interface#--fix">
            <code>--fix</code> ESLint command line option
          </Link>
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
          <Link href="https://eslint.org/docs/latest/developer-guide/working-with-rules#providing-suggestions">
            suggestions
          </Link>
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
          <Link href="/linting/typed-linting" target="_blank">
            type information
          </Link>{' '}
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
