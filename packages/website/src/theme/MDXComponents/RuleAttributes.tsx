/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Link from '@docusaurus/Link';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import type { RuleMetaDataDocs } from '@typescript-eslint/utils/ts-eslint';
import React from 'react';

import {
  FIXABLE_EMOJI,
  RECOMMENDED_CONFIG_EMOJI,
  STRICT_CONFIG_EMOJI,
  STYLISTIC_CONFIG_EMOJI,
  SUGGESTIONS_EMOJI,
} from '../../components/constants';
import type { FeatureProps } from './Feature';
import { Feature } from './Feature';
import styles from './RuleAttributes.module.css';

const recommendations = {
  recommended: [RECOMMENDED_CONFIG_EMOJI, 'recommended'],
  strict: [STRICT_CONFIG_EMOJI, 'strict'],
  stylistic: [STYLISTIC_CONFIG_EMOJI, 'stylistic'],
};

type MakeRequired<Base, Key extends keyof Base> = Omit<Base, Key> & {
  [K in Key]-?: NonNullable<Base[Key]>;
};

type RecommendedRuleMetaDataDocs<Options extends readonly unknown[]> =
  MakeRequired<RuleMetaDataDocs<Options>, 'recommended'>;

const isRecommendedDocs = (
  docs: RuleMetaDataDocs<unknown[]>,
): docs is RecommendedRuleMetaDataDocs<unknown[]> => !!docs.recommended;

const getRecommendation = (
  docs: RecommendedRuleMetaDataDocs<unknown[]>,
): string[] => {
  const recommended = docs.recommended;
  const recommendation =
    recommendations[
      typeof recommended === 'object' ? 'recommended' : recommended
    ];

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

  if (isRecommendedDocs(rule.docs)) {
    const [emoji, recommendation] = getRecommendation(rule.docs);
    features.push({
      children: (
        <>
          Extending{' '}
          <Link to={`/users/configs#${recommendation}`} target="_blank">
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
      emoji: FIXABLE_EMOJI,
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
      emoji: SUGGESTIONS_EMOJI,
    });
  }

  if (rule.docs.requiresTypeChecking) {
    features.push({
      children: (
        <>
          This rule requires{' '}
          <Link href="/getting-started/typed-linting" target="_blank">
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
