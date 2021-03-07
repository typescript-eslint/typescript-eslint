import Expander from './expander';
import React, { useCallback, useState } from 'react';
import styles from './options-selector.module.css';
import { DeleteIcon, AddIcon } from './icons';
import { QueryParamOptions } from './lib/utils';

interface OptionSelectorParams extends QueryParamOptions {
  ruleOptions: string[];
  onUpdate(value: Partial<QueryParamOptions>): void;
}

function computeRuleOptions(
  rules: Record<string, unknown>,
  ruleNames: string[],
): string[] {
  const keys = Object.keys(rules);
  return ruleNames.filter(name => !keys.includes(name));
}

function OptionsSelector(params: OptionSelectorParams): JSX.Element {
  const [jsx, setJsx] = useState<boolean>(() => params.jsx ?? false);
  const [showAST, setShowAST] = useState<boolean>(
    () => params.showAST ?? false,
  );
  const [sourceType, setSourceType] = useState<'script' | 'module'>(
    () => params.sourceType ?? 'module',
  );
  const [rules, setRules] = useState<Record<string, unknown>>(
    () => params.rules ?? {},
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
            onChange={(e): void => {
              setJsx(e.target.checked);
              params.onUpdate({ jsx: e.target.checked ?? false });
            }}
            name="jsx"
            className={styles.optionCheckbox}
            type="checkbox"
          />
        </label>
        <label className={styles.optionLabel}>
          Show AST
          <input
            checked={showAST}
            onChange={(e): void => {
              setShowAST(e.target.checked);
              params.onUpdate({ showAST: e.target.checked ?? false });
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
            value={sourceType}
            className={styles.optionSelect}
            onChange={(e): void => {
              setSourceType(e.target.value as 'script' | 'module');
              params.onUpdate({
                sourceType: e.target.value as 'script' | 'module',
              });
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
                name="ruleName2"
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
