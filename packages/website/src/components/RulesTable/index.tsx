import Link from '@docusaurus/Link';
import type { RulesMeta } from '@site/rulesMeta';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';

import styles from './styles.module.css';

function interpolateCode(text: string): (JSX.Element | string)[] | string {
  const fragments = text.split(/`(.*?)`/);
  if (fragments.length === 1) {
    return text;
  }
  return fragments.map((v, i) => (i % 2 === 0 ? v : <code key={i}>{v}</code>));
}

function RuleRow({ rule }: { rule: RulesMeta[number] }): JSX.Element | null {
  if (!rule.docs?.url) {
    return null;
  }
  const { fixable, hasSuggestions } = rule;
  const { recommended, requiresTypeChecking } = rule.docs;
  return (
    <tr>
      <td>
        <Link to={new URL(rule.docs.url).pathname}>
          <code>@typescript-eslint/{rule.name}</code>
        </Link>
        <br />
        {interpolateCode(rule.docs.description)}
      </td>
      <td className={styles.attrCol} title={recommended}>
        {recommended === 'recommended'
          ? '✅'
          : recommended === 'strict'
          ? '🔒'
          : recommended
          ? '🎨'
          : ''}
      </td>
      <td
        className={styles.attrCol}
        title={
          fixable && hasSuggestions
            ? 'fixable and has suggestions'
            : fixable
            ? 'fixable'
            : hasSuggestions
            ? 'has suggestions'
            : undefined
        }
      >
        {fixable ? '🔧\n' : '\n'}
        {hasSuggestions ? '💡' : ''}
      </td>
      <td
        className={styles.attrCol}
        title={requiresTypeChecking ? 'requires type information' : undefined}
      >
        {requiresTypeChecking ? '💭' : ''}
      </td>
    </tr>
  );
}

const filterModes = ['neutral', 'include', 'exclude'] as const;
type FilterMode = typeof filterModes[number];

function RuleFilterCheckBox({
  label,
  setMode,
  mode,
}: {
  label: string;
  setMode: (mode: FilterMode) => void;
  mode: FilterMode;
}): JSX.Element {
  const toNextMode = (): void =>
    setMode(filterModes[(filterModes.indexOf(mode) + 1) % filterModes.length]);
  return (
    <li className={styles.checkboxListItem}>
      <button
        type="button"
        className={clsx(
          styles.checkboxLabel,
          mode === 'include' && styles.activated,
          mode === 'exclude' && styles.deactivated,
        )}
        onKeyDown={(e): void => {
          if (e.key === 'Enter') {
            toNextMode();
          }
        }}
        onClick={toNextMode}
        aria-label={`Toggle the filter mode. Current: ${mode}`}
      >
        <div
          aria-hidden
          className={clsx(styles.visual, styles[`visual-${mode}`])}
        />
        {label}
      </button>
    </li>
  );
}

function match(mode: FilterMode, value: boolean): boolean | undefined {
  if (mode === 'exclude') {
    return !value;
  }
  if (mode === 'include') {
    return value;
  }
  return undefined;
}

export default function RulesTable({
  extensionRules,
}: {
  extensionRules?: boolean;
}): JSX.Element {
  const rules = useRulesMeta();
  const [showRecommended, setShowRecommended] = useState<FilterMode>('neutral');
  const [showStrict, setShowStrict] = useState<FilterMode>('neutral');
  const [showStylistic, setShowStylistic] = useState<FilterMode>('neutral');
  const [showFixable, setShowFixable] = useState<FilterMode>('neutral');
  const [showHasSuggestions, setShowHasSuggestion] =
    useState<FilterMode>('neutral');
  const [showTypeCheck, setShowTypeCheck] = useState<FilterMode>('neutral');
  const relevantRules = useMemo(
    () =>
      rules
        .filter(r => !!extensionRules === !!r.docs?.extendsBaseRule)
        .filter(r => {
          const opinions = [
            match(showRecommended, r.docs?.recommended === 'recommended'),
            match(
              showStrict,
              r.docs?.recommended === 'recommended' ||
                r.docs?.recommended === 'strict',
            ),
            match(showStylistic, r.docs?.recommended === 'stylistic'),
            match(showFixable, !!r.fixable),
            match(showHasSuggestions, !!r.hasSuggestions),
            match(showTypeCheck, !!r.docs?.requiresTypeChecking),
          ].filter((o): o is boolean => o !== undefined);
          return opinions.every(o => o);
        }),
    [
      rules,
      extensionRules,
      showRecommended,
      showStrict,
      showStylistic,
      showFixable,
      showHasSuggestions,
      showTypeCheck,
    ],
  );
  return (
    <>
      <div className={styles.checkboxListArea}>
        <em>Config Group</em>
        <ul className={clsx('clean-list', styles.checkboxList)}>
          <RuleFilterCheckBox
            mode={showRecommended}
            setMode={setShowRecommended}
            label="✅ recommended"
          />
          <RuleFilterCheckBox
            mode={showStrict}
            setMode={setShowStrict}
            label="🔒 strict"
          />
          <RuleFilterCheckBox
            mode={showStylistic}
            setMode={setShowStylistic}
            label="🎨 stylistic"
          />
        </ul>
      </div>
      <div className={styles.checkboxListArea}>
        <em>Metadata</em>
        <ul className={clsx('clean-list', styles.checkboxList)}>
          <RuleFilterCheckBox
            mode={showFixable}
            setMode={setShowFixable}
            label="🔧 fixable"
          />
          <RuleFilterCheckBox
            mode={showHasSuggestions}
            setMode={setShowHasSuggestion}
            label="💡 has suggestions"
          />
          <RuleFilterCheckBox
            mode={showTypeCheck}
            setMode={setShowTypeCheck}
            label="💭 requires type information"
          />
        </ul>
      </div>
      <table className={styles.rulesTable}>
        <thead>
          <tr>
            <th className={styles.ruleCol}>Rule</th>
            <th className={styles.attrCol}>Config</th>
            <th className={styles.attrCol}>Fixer</th>
            <th className={styles.attrCol}>Typed</th>
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
