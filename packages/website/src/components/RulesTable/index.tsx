import type { RulesMeta } from '@site/rulesMeta';
import type {
  DeprecatedInfo,
  RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';

import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { useRulesMeta } from '@site/src/hooks/useRulesMeta';
import clsx from 'clsx';
import React, { useMemo } from 'react';

import type { HistorySelector } from '../../hooks/useHistorySelector';

import { useHistorySelector } from '../../hooks/useHistorySelector';
import { getRecommendationWithEmoji } from '../../theme/MDXComponents/RuleAttributes';
import {
  CONFIG_EMOJI,
  DEPRECATED_RULE_EMOJI,
  EXTENSION_RULE_EMOJI,
  FIXABLE_EMOJI,
  RECOMMENDED_CONFIG_EMOJI,
  STRICT_CONFIG_EMOJI,
  STYLISTIC_CONFIG_EMOJI,
  SUGGESTIONS_EMOJI,
  TYPE_INFORMATION_EMOJI,
} from '../constants';
import { isRuleFrozen } from '../lib/isRuleFrozen';
import styles from './styles.module.css';

function interpolateCode(
  text: string,
): string | (string | React.JSX.Element)[] {
  const fragments = text.split(/`(.*?)`/);
  if (fragments.length === 1) {
    return text;
  }
  return fragments.map((v, i) => (i % 2 === 0 ? v : <code key={i}>{v}</code>));
}

function getActualRecommended({
  docs,
}: RulesMeta[number]): ['', ''] | [string, RuleRecommendation] {
  const recommended = docs.recommended;
  return recommended ? getRecommendationWithEmoji(recommended) : ['', ''];
}

function isRealDeprecated(
  deprecated: boolean | DeprecatedInfo | undefined,
): boolean {
  if (typeof deprecated === 'boolean') {
    return deprecated;
  }
  if (isRuleFrozen(deprecated)) {
    return false;
  }
  return !!deprecated;
}

function RuleRow({
  rule,
}: {
  rule: RulesMeta[number];
}): React.JSX.Element | null {
  if (!rule.docs.url) {
    return null;
  }
  const { deprecated, fixable, hasSuggestions } = rule;
  const isDeprecated = isRealDeprecated(deprecated);
  const { extendsBaseRule, requiresTypeChecking } = rule.docs;
  const [emoji, actualRecommended] = getActualRecommended(rule);
  return (
    <tr>
      <td>
        <div className={styles.ruleNameWrapper}>
          <Link to={new URL(rule.docs.url).pathname}>
            <code>@typescript-eslint/{rule.name}</code>
          </Link>
          {isRuleFrozen(rule.deprecated) && <span>❄️</span>}
        </div>
        <br />
        {interpolateCode(rule.docs.description)}
      </td>
      <td className={styles.attrCol} title={actualRecommended}>
        {emoji}
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
        {fixable ? FIXABLE_EMOJI : ''}
        {fixable && hasSuggestions ? <br /> : ''}
        {hasSuggestions ? SUGGESTIONS_EMOJI : ''}
      </td>
      <td
        className={styles.attrCol}
        title={requiresTypeChecking ? 'requires type information' : undefined}
      >
        {requiresTypeChecking ? TYPE_INFORMATION_EMOJI : ''}
      </td>
      <td
        className={styles.attrCol}
        title={extendsBaseRule ? 'extends base rule' : undefined}
      >
        {extendsBaseRule ? EXTENSION_RULE_EMOJI : ''}
      </td>
      <td
        className={styles.attrCol}
        title={isDeprecated ? 'deprecated' : undefined}
      >
        {isDeprecated ? DEPRECATED_RULE_EMOJI : ''}
      </td>
    </tr>
  );
}

const filterModes = ['neutral', 'include', 'exclude'] as const;
type FilterMode = (typeof filterModes)[number];

function RuleFilterCheckBox({
  label,
  mode,
  setMode,
}: {
  label: string;
  mode: FilterMode;
  setMode: (mode: FilterMode) => void;
}): React.JSX.Element {
  const toNextMode = (): void =>
    setMode(filterModes[(filterModes.indexOf(mode) + 1) % filterModes.length]);
  return (
    <li className={styles.checkboxListItem}>
      <button
        aria-label={`Toggle the filter mode. Current: ${mode}`}
        className={clsx(
          styles.checkboxLabel,
          mode === 'include' && styles.activated,
          mode === 'exclude' && styles.deactivated,
        )}
        onClick={toNextMode}
        onKeyDown={(e): void => {
          if (e.key === 'Enter') {
            toNextMode();
          }
        }}
        type="button"
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

export default function RulesTable(): React.JSX.Element {
  const [filters, changeFilter] = useRulesFilters();

  const rules = useRulesMeta();
  const relevantRules = useMemo(
    () =>
      rules.filter(r => {
        const actualRecommended = getActualRecommended(r)[1];
        const opinions = [
          match(filters.recommended, actualRecommended === 'recommended'),
          match(
            filters.strict,
            actualRecommended === 'recommended' ||
              actualRecommended === 'strict',
          ),
          match(filters.stylistic, actualRecommended === 'stylistic'),
          match(filters.fixable, !!r.fixable),
          match(filters.suggestions, !!r.hasSuggestions),
          match(filters.typeInformation, !!r.docs.requiresTypeChecking),
          match(filters.extension, !!r.docs.extendsBaseRule),
          match(filters.deprecated, isRealDeprecated(r.deprecated)),
        ].filter(
          (o): o is boolean =>
            // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
            o !== undefined,
        );
        return opinions.every(o => o);
      }),
    [rules, filters],
  );

  return (
    <>
      <div className={styles.checkboxListArea}>
        <em>Config Group ({CONFIG_EMOJI})</em>
        <ul className={clsx('clean-list', styles.checkboxList)}>
          <RuleFilterCheckBox
            label={`${RECOMMENDED_CONFIG_EMOJI} recommended`}
            mode={filters.recommended}
            setMode={(newMode): void => changeFilter('recommended', newMode)}
          />
          <RuleFilterCheckBox
            label={`${STRICT_CONFIG_EMOJI} strict`}
            mode={filters.strict}
            setMode={(newMode): void => changeFilter('strict', newMode)}
          />
          <RuleFilterCheckBox
            label={`${STYLISTIC_CONFIG_EMOJI} stylistic`}
            mode={filters.stylistic}
            setMode={(newMode): void => changeFilter('stylistic', newMode)}
          />
        </ul>
      </div>
      <div className={styles.checkboxListArea}>
        <em>Metadata</em>
        <ul className={clsx('clean-list', styles.checkboxList)}>
          <RuleFilterCheckBox
            label={`${FIXABLE_EMOJI} fixable`}
            mode={filters.fixable}
            setMode={(newMode): void => changeFilter('fixable', newMode)}
          />
          <RuleFilterCheckBox
            label={`${SUGGESTIONS_EMOJI} has suggestions`}
            mode={filters.suggestions}
            setMode={(newMode): void => changeFilter('suggestions', newMode)}
          />
          <RuleFilterCheckBox
            label={`${TYPE_INFORMATION_EMOJI} type checked`}
            mode={filters.typeInformation}
            setMode={(newMode): void =>
              changeFilter('typeInformation', newMode)
            }
          />
          <RuleFilterCheckBox
            label={`${EXTENSION_RULE_EMOJI} extension`}
            mode={filters.extension}
            setMode={(newMode): void => changeFilter('extension', newMode)}
          />
          <RuleFilterCheckBox
            label={`${DEPRECATED_RULE_EMOJI} deprecated`}
            mode={filters.deprecated}
            setMode={(newMode): void => changeFilter('deprecated', newMode)}
          />
        </ul>
      </div>
      <p>
        (These categories are explained in{' '}
        <a href="#filtering">more detail below</a>.)
      </p>
      <table className={styles.rulesTable}>
        <thead>
          <tr>
            <th className={styles.ruleCol}>Rule</th>
            <th className={styles.attrCol}>
              <div title="The config group that the rule belongs to, if any.">
                {CONFIG_EMOJI}
              </div>
            </th>
            <th className={styles.attrCol}>
              <div title="Whether the rule has an auto-fixer and/or has suggestions.">
                {FIXABLE_EMOJI}
              </div>
            </th>
            <th className={styles.attrCol}>
              <div title="Whether the rule requires type information from the TypeScript compiler.">
                {TYPE_INFORMATION_EMOJI}
              </div>
            </th>
            <th className={styles.attrCol}>
              <div title="Whether the rule is an extension rule (i.e. based on a core ESLint rule).">
                {EXTENSION_RULE_EMOJI}
              </div>
            </th>
            <th className={styles.attrCol}>
              <div title="Whether the rule is deprecated.">
                {DEPRECATED_RULE_EMOJI}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {relevantRules.map(rule => (
            <RuleRow key={rule.name} rule={rule} />
          ))}
        </tbody>
      </table>
    </>
  );
}

type FilterCategory =
  | 'deprecated'
  | 'extension'
  | 'fixable'
  | 'recommended'
  | 'strict'
  | 'stylistic'
  | 'suggestions'
  | 'typeInformation';
type FiltersState = Record<FilterCategory, FilterMode>;
const neutralFiltersState: FiltersState = {
  deprecated: 'neutral',
  extension: 'neutral',
  fixable: 'neutral',
  recommended: 'neutral',
  strict: 'neutral',
  stylistic: 'neutral',
  suggestions: 'neutral',
  typeInformation: 'neutral',
};

const selectSearch: HistorySelector<string> = history =>
  history.location.search;
const getServerSnapshot = (): string => '';

/**
 * @param paramsKey Optional. Whether to include rules that match the particular
 * search filter. Defaults to an empty string, which matches all rules.
 */
function useRulesFilters(
  paramsKey = '',
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
      res[key as keyof typeof neutralFiltersState] = exclude
        ? 'exclude'
        : 'include';
    }
  }

  return res;
}
