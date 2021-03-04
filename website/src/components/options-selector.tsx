import Expander from './expander';
import React, { useCallback, useState } from 'react';
import styles from './options-selector.module.css';
import { DeleteIcon, AddIcon } from './icons';
import { QueryParamOptions } from './lib/utils';

interface OptionSelectorParams extends QueryParamOptions {
  onUpdate(value: Partial<QueryParamOptions>): void;
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

  const addRule = useCallback(() => {
    const newRules = { ...rules, [ruleName]: ['error'] };
    setRules(newRules);
    setRuleName('');
    params.onUpdate({ rules: newRules });
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
          <div className={styles.optionItem}>
            <input
              value={ruleName}
              className={styles.optionInput}
              onChange={e => {
                setRuleName(e.target.value);
              }}
              style={{ width: '90%' }}
              type="text"
            />
            <AddIcon className={styles.clickableIcon} onClick={addRule} />
          </div>
        </div>
      </Expander>
    </>
  );
}

export default OptionsSelector;
