import React from 'react';
import type { TSESLint } from '@typescript-eslint/utils';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';

import styles from './RuleAttributes.module.css';

export function RuleAttributes({ name }: { name: string }): JSX.Element | null {
  const rules = useRulesMeta();
  const rule = rules.find(rule => rule.name === name);
  if (!rule) {
    return null;
  }
  return (
    <>
      <h2 id="attributes">Attributes</h2>
      <ul className={styles.taskList}>
        <li>
          <input type="checkbox" disabled checked={!!rule.docs?.recommended} />
          Included in configs
          <ul className={styles.taskList}>
            <li>
              <input
                type="checkbox"
                disabled
                checked={(
                  ['error', 'warn'] as (
                    | TSESLint.RuleRecommendation
                    | undefined
                  )[]
                ).includes(rule.docs?.recommended)}
              />
              ✅ Recommended
            </li>
            <li>
              <input
                type="checkbox"
                disabled
                checked={rule.docs?.recommended === 'strict'}
              />
              🔒 Strict
            </li>
          </ul>
        </li>
        <li>
          <input
            type="checkbox"
            disabled
            checked={!!rule.fixable || rule.hasSuggestions}
          />
          Fixable
          <ul className={styles.taskList}>
            <li>
              <input type="checkbox" disabled checked={!!rule.fixable} />
              🔧 Automated Fixer
            </li>
            <li>
              <input type="checkbox" disabled checked={!!rule.hasSuggestions} />
              💡 Suggestion Fixer
            </li>
          </ul>
        </li>
        <li>
          <input
            type="checkbox"
            disabled
            checked={!!rule.docs?.requiresTypeChecking}
          />
          💭 Requires type information
        </li>
      </ul>
    </>
  );
}
