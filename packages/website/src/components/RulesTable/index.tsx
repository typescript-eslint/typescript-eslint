import React, { useState, useId } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import type { RulesMeta } from '@site/rulesMeta';

import styles from './styles.module.css';

function interpolateCode(text: string): (JSX.Element | string)[] | string {
  const fragments = text.split(/`(.*?)`/);
  if (fragments.length === 1) {
    return text;
  }
  return fragments.map((v, i) => (i % 2 === 0 ? v : <code key={i}>{v}</code>));
}

function RuleRow({ rule }: { rule: RulesMeta[number] }): JSX.Element | null {
  if (!rule.docs || !rule.docs.url) {
    return null;
  }
  return (
    <tr>
      <td>
        <Link to={new URL(rule.docs.url).pathname}>
          <code>@typescript-eslint/{rule.name}</code>
        </Link>
      </td>
      <td>{interpolateCode(rule.docs.description)}</td>
      <td>
        {rule.docs.recommended === 'strict'
          ? '🔒'
          : rule.docs.recommended
          ? '✅'
          : ''}
      </td>
      <td>
        {rule.fixable ? '🔧' : ''}
        {rule.hasSuggestions ? '🛠' : ''}
      </td>
      <td>{rule.docs.requiresTypeChecking ? '💭' : ''}</td>
    </tr>
  );
}

function RuleFilterCheckBox({
  label,
  onToggle,
  selected,
}: {
  label: string;
  onToggle: () => void;
  selected: boolean;
}): JSX.Element {
  const id = useId();
  return (
    <li className={styles.checkboxListItem}>
      <input
        id={id}
        type="checkbox"
        className="screen-reader-only"
        onKeyDown={(e): void => {
          if (e.key === 'Enter') {
            onToggle();
          }
        }}
        onFocus={(e): void => {
          if (e.relatedTarget) {
            e.target.nextElementSibling?.dispatchEvent(
              new KeyboardEvent('focus'),
            );
          }
        }}
        onBlur={(e): void => {
          e.target.nextElementSibling?.dispatchEvent(new KeyboardEvent('blur'));
        }}
        onChange={onToggle}
        checked={selected}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        {label}
      </label>
    </li>
  );
}

export default function RulesTable({
  extensionRules,
}: {
  extensionRules?: boolean;
}): JSX.Element {
  const rules = useDocusaurusContext().siteConfig.customFields!
    .rules as RulesMeta;
  const [showRecommended, setShowRecommended] = useState(true);
  const [showStrict, setShowStrict] = useState(true);
  const [showFixable, setShowFixable] = useState(true);
  const [showHasSuggestions, setShowHasSuggestion] = useState(true);
  const [showTypeCheck, setShowTypeCheck] = useState(true);
  const relevantRules = rules.filter(
    r =>
      !!extensionRules === !!r.docs?.extendsBaseRule &&
      ((showRecommended &&
        (r.docs?.recommended === 'error' || r.docs?.recommended === 'warn')) ||
        (showStrict && r.docs?.recommended === 'strict') ||
        (showFixable && !!r.fixable) ||
        (showHasSuggestions && r.hasSuggestions) ||
        (showTypeCheck && !!r.docs?.requiresTypeChecking)),
  );
  return (
    <>
      <ul className={clsx('clean-list', styles.checkboxList)}>
        <RuleFilterCheckBox
          selected={showRecommended}
          onToggle={(): void => setShowRecommended(v => !v)}
          label="✅ recommended"
        />
        <RuleFilterCheckBox
          selected={showStrict}
          onToggle={(): void => setShowStrict(v => !v)}
          label="🔒 strict"
        />
        <RuleFilterCheckBox
          selected={showFixable}
          onToggle={(): void => setShowFixable(v => !v)}
          label="🔧 fixable"
        />
        <RuleFilterCheckBox
          selected={showHasSuggestions}
          onToggle={(): void => setShowHasSuggestion(v => !v)}
          label="🛠 has suggestions"
        />
        <RuleFilterCheckBox
          selected={showTypeCheck}
          onToggle={(): void => setShowTypeCheck(v => !v)}
          label="💭 requires type information"
        />
      </ul>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>✅🔒</th>
            <th>🔧🛠</th>
            <th>💭</th>
          </tr>
        </thead>
        <tbody>
          {relevantRules.map(rule => (
            <RuleRow rule={rule} key={rule.name} />
          ))}
        </tbody>
      </table>
    </>
  );
}
