import Expander from './expander';
import React, { useCallback, useState } from 'react';
import styles from './options-selector.module.css';
import { DeleteIcon, AddIcon } from './icons';
import { HashStateOptions } from './lib/use-hash-state';
import clsx from 'clsx';

function computeRuleOptions(
  rules: Record<string, unknown>,
  ruleNames: string[],
): string[] {
  const keys = Object.keys(rules);
  return ruleNames.filter(name => !keys.includes(name));
}

interface OptionsSelectorParams<T = HashStateOptions> {
  ruleOptions: string[];
  state: T;
  setState: (key: keyof T, value: unknown) => void;
  tsVersions: readonly string[];
}

function OptionsSelector({
  ruleOptions,
  state,
  setState,
  tsVersions,
}: OptionsSelectorParams): JSX.Element {
  const [ruleName, setRuleName] = useState<string>('');

  const removeRule = useCallback(
    (item: string) => {
      const { [item]: _, ...newRules } = state.rules ?? {};
      setState('rules', newRules);
    },
    [state],
  );

  const computedRules = computeRuleOptions(state.rules ?? {}, ruleOptions);

  const addRule = useCallback(() => {
    if (computedRules.length) {
      const newRules = {
        ...state.rules,
        [ruleName || computedRules[0]]: ['error'],
      };
      setState('rules', newRules);
      setRuleName('');
    }
  }, [state, ruleName]);

  const updateTS = useCallback((version: string) => {
    setState('ts', version);
  }, []);

  return (
    <>
      <Expander label="Info">
        <label className={styles.optionLabel}>
          TypeScript
          <select
            name="ts"
            value={state.ts}
            className={clsx(styles.optionSelect, 'text--right')}
            onChange={(e): void => {
              updateTS(e.target.value);
            }}
          >
            {((tsVersions.length && tsVersions) || [state.ts])
              .filter(item => parseFloat(item) >= 3.3)
              .map(item => {
                return (
                  <option key={item} value={item}>
                    {item}
                  </option>
                );
              })}
          </select>
        </label>
        <label className={styles.optionLabel}>
          Eslint
          <span>{process.env.ESLINT_VERSION}</span>
        </label>
        <label className={styles.optionLabel}>
          TSEslint
          <span>{process.env.TS_ESLINT_VERSION}</span>
        </label>
      </Expander>
      <Expander label="Options">
        <label className={styles.optionLabel}>
          Enable jsx
          <input
            checked={state.jsx}
            onChange={(e): void => {
              setState('jsx', e.target.checked ?? false);
            }}
            name="jsx"
            className={styles.optionCheckbox}
            type="checkbox"
          />
        </label>
        <label className={styles.optionLabel}>
          Show AST
          <input
            checked={state.showAST}
            onChange={(e): void => {
              setState('showAST', e.target.checked ?? false);
            }}
            name="ast"
            className={styles.optionCheckbox}
            type="checkbox"
          />
        </label>
        <label className={styles.optionLabel}>
          Source type
          <select
            name="sourceType"
            value={state.sourceType}
            className={styles.optionSelect}
            onChange={(e): void => {
              setState('sourceType', e.target.value as 'script' | 'module');
            }}
          >
            <option value="script">script</option>
            <option value="module">module</option>
          </select>
        </label>
      </Expander>
      <Expander label="Rules">
        {Object.entries(state.rules ?? {}).map(([rule]) => (
          <label className={styles.optionItem} key={'rules' + rule}>
            {rule}
            <DeleteIcon
              className={styles.clickableIcon}
              onClick={(): void => removeRule(rule)}
            />
          </label>
        ))}
        <div>
          <label className={styles.optionItem}>Add rule</label>
          {computedRules.length ? (
            <div className={styles.optionItem}>
              <select
                value={ruleName}
                name="ruleName"
                onChange={(e): void => {
                  setRuleName(e.target.value);
                }}
                className={styles.optionInput}
              >
                {computedRules.map(item => {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  );
                })}
              </select>
              <AddIcon className={styles.clickableIcon} onClick={addRule} />
            </div>
          ) : (
            <div />
          )}
        </div>
      </Expander>
    </>
  );
}

export default OptionsSelector;
