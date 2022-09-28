import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import React from 'react';

import styles from './RuleAttributes.module.css';

const recommendations = {
  error: '✅ recommended',
  warn: '✅ recommended',
  strict: '🔒 Strict',
  false: 'none',
};

export function RuleAttributes({ name }: { name: string }): JSX.Element | null {
  const rules = useRulesMeta();
  const rule = rules.find(rule => rule.name === name);
  if (!rule?.docs) {
    return null;
  }

  return (
    <>
      <h2 id="attributes">Attributes</h2>
      <ul className={styles.taskList}>
        <li>
          <input type="checkbox" disabled checked={!!rule.docs.recommended} />
          Included in config: {recommendations[`${rule.docs.recommended}`]}
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
            checked={!!rule.docs.requiresTypeChecking}
          />
          💭 Requires type information
        </li>
      </ul>
    </>
  );
}
