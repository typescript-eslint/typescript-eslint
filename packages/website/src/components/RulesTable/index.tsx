import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import type { RulesMeta } from '@site/rulesMeta';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import clsx from 'clsx';
import React, { useMemo } from 'react';

import {
  type HistorySelector,
  useHistorySelector,
} from '../../hooks/useHistorySelector';
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
      <td
        className={styles.attrCol}
        title={
          recommended === 'strict'
            ? 'strict'
            : recommended
            ? 'recommended'
            : undefined
        }
      >
        {recommended === 'strict' ? '🔒' : recommended ? '✅' : ''}
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
  ruleset,
}: {
  ruleset: 'extension-rules' | 'supported-rules';
}): JSX.Element {
  const [filters, changeFilter] = useRulesFilters(ruleset);

  const rules = useRulesMeta();
  const extensionRules = ruleset === 'extension-rules';
  const relevantRules = useMemo(
    () =>
      rules
        .filter(r => !!extensionRules === !!r.docs?.extendsBaseRule)
        .filter(r => {
          const opinions = [
            match(
              filters.recommended,
              r.docs?.recommended === 'error' || r.docs?.recommended === 'warn',
            ),
            match(filters.strict, r.docs?.recommended === 'strict'),
            match(filters.fixable, !!r.fixable),
            match(filters.suggestions, !!r.hasSuggestions),
            match(filters.typeInformation, !!r.docs?.requiresTypeChecking),
          ].filter((o): o is boolean => o !== undefined);
          return opinions.every(o => o);
        }),
    [rules, extensionRules, filters],
  );

  return (
    <>
      <ul className={clsx('clean-list', styles.checkboxList)}>
        <RuleFilterCheckBox
          mode={filters.recommended}
          setMode={(newMode): void => changeFilter('recommended', newMode)}
          label="✅ recommended"
        />
        <RuleFilterCheckBox
          mode={filters.strict}
          setMode={(newMode): void => changeFilter('strict', newMode)}
          label="🔒 strict"
        />
        <RuleFilterCheckBox
          mode={filters.fixable}
          setMode={(newMode): void => changeFilter('fixable', newMode)}
          label="🔧 fixable"
        />
        <RuleFilterCheckBox
          mode={filters.suggestions}
          setMode={(newMode): void => changeFilter('suggestions', newMode)}
          label="💡 has suggestions"
        />
        <RuleFilterCheckBox
          mode={filters.typeInformation}
          setMode={(newMode): void => changeFilter('typeInformation', newMode)}
          label="💭 requires type information"
        />
      </ul>
      <table className={styles.rulesTable}>
        <thead>
          <tr>
            <th className={styles.ruleCol}>Rule</th>
            <th className={styles.attrCol} title={'✅ recommended\n🔒 strict'}>
              ✅{'\n'}🔒
            </th>
            <th
              className={styles.attrCol}
              title={'🔧 fixable\n💡 has suggestions'}
            >
              🔧{'\n'}💡
            </th>
            <th className={styles.attrCol} title="💭 requires type information">
              💭
            </th>
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

type FilterCategory =
  | 'recommended'
  | 'strict'
  | 'fixable'
  | 'suggestions'
  | 'typeInformation';
type FiltersState = Record<FilterCategory, FilterMode>;
const neutralFiltersState: FiltersState = {
  recommended: 'neutral',
  strict: 'neutral',
  fixable: 'neutral',
  suggestions: 'neutral',
  typeInformation: 'neutral',
};

const selectSearch: HistorySelector<string> = history =>
  history.location.search;
const getServerSnapshot = (): string => '';

function useRulesFilters(
  paramsKey: string,
): [FiltersState, (category: FilterCategory, mode: FilterMode) => void] {
  const history = useHistory();
  const search = useHistorySelector(selectSearch, getServerSnapshot);

  const paramValue = new URLSearchParams(search).get(paramsKey) ?? '';
  // We can't compute this in selectSearch, because we need the snapshot to be
  // comparable by value.
  const filtersState = useMemo(
    () => parseFiltersState(paramValue),
    [paramValue],
  );

  const changeFilter = (category: FilterCategory, mode: FilterMode): void => {
    const newState = { ...filtersState, [category]: mode };

    if (
      category === 'strict' &&
      mode === 'include' &&
      filtersState.recommended === 'include'
    ) {
      newState.recommended = 'exclude';
    } else if (
      category === 'recommended' &&
      mode === 'include' &&
      filtersState.strict === 'include'
    ) {
      newState.strict = 'exclude';
    }

    const searchParams = new URLSearchParams(history.location.search);
    const filtersString = stringifyFiltersState(newState);

    if (filtersString) {
      searchParams.set(paramsKey, filtersString);
    } else {
      searchParams.delete(paramsKey);
    }

    history.replace({ search: searchParams.toString() });
  };

  return [filtersState, changeFilter];
}

const NEGATION_SYMBOL = 'x';

function stringifyFiltersState(filters: FiltersState): string {
  return Object.entries(filters)
    .map(([key, value]) =>
      value === 'include'
        ? key
        : value === 'exclude'
        ? `${NEGATION_SYMBOL}${key}`
        : '',
    )
    .filter(Boolean)
    .join('-');
}

function parseFiltersState(str: string): FiltersState {
  const res: FiltersState = { ...neutralFiltersState };

  for (const part of str.split('-')) {
    const exclude = part.startsWith(NEGATION_SYMBOL);
    const key = exclude ? part.slice(1) : part;
    if (Object.hasOwn(neutralFiltersState, key)) {
      res[key] = exclude ? 'exclude' : 'include';
    }
  }

  return res;
}
