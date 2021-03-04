import Expander from './expander';
import React, { useCallback, useState } from 'react';
import styles from './options-selector.module.css';
import { DeleteIcon, AddIcon } from './icons';
import { QueryParamOptions } from './lib/utils';

interface OptionSelectorParams extends QueryParamOptions {
  ruleOptions: string[];
  onUpdate(value: Partial<QueryParamOptions>): void;
}

function computeRuleOptions(rules: Record<string, any>, ruleNames: string[]) {
  const keys = Object.keys(rules);
  return ruleNames.filter(name => !keys.includes(name));
}

function OptionsSelector(params: OptionSelectorParams) {
  const [jsx, setJsx] = useState<boolean>(() => params.jsx || false);
  const [sourceType, setSourceType] = useState<string>(
    () => params.sourceType || 'module',
  );
  const [rules, setRules] = useState<Record<string, any>>(
    () => params.rules || {},
  );
  const [ruleName, setRuleName] = useState<string>('');

  const removeRule = useCallback(
    (item: string) => {
      const { [item]: _, ...newRules } = rules;
      setRules(newRules);
      params.onUpdate({ rules: newRules });
    },
    [rules],
  );

  const computedRules = computeRuleOptions(rules, params.ruleOptions);

  const addRule = useCallback(() => {
    if (computedRules.length) {
      const newRules = {
        ...rules,
        [ruleName || computedRules[0]]: ['error'],
      };
      setRules(newRules);
      setRuleName('');
      params.onUpdate({ rules: newRules });
    }
  }, [rules, ruleName]);

  return (
    <>
      <Expander label="Options">
        <label className={styles.optionLabel}>
          Enable jsx
          <input
            checked={jsx}
            onChange={e => {
              setJsx(e.target.checked);
              params.onUpdate({ jsx: e.target.checked });
            }}
            name="jsx"
            className={styles.optionCheckbox}
            type="checkbox"
          />
        </label>
        <label className={styles.optionLabel}>
          Source type
          <select
            name="sourceType"
            value={sourceType}
            className={styles.optionSelect}
            onChange={e => {
              setSourceType(e.target.value);
              // @ts-ignore
              params.onUpdate({ sourceType: e.target.value });
            }}
          >
            <option value="script">script</option>
            <option value="module">module</option>
          </select>
        </label>
      </Expander>
      <Expander label="Rules">
        {Object.entries(rules).map(([rule]) => (
          <label className={styles.optionItem} key={'rules' + rule}>
            {rule}
            <DeleteIcon
              className={styles.clickableIcon}
              onClick={() => removeRule(rule)}
            />
          </label>
        ))}
        <div>
          <label className={styles.optionItem}>Add rule</label>
          {computedRules.length ? (
            <div className={styles.optionItem}>
              <select
                value={ruleName}
                name="ruleName2"
                onChange={e => {
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
