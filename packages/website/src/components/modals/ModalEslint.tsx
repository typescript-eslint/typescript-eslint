import React, { useCallback, useEffect, useReducer, useState } from 'react';
import clsx from 'clsx';
import type { RulesRecord } from '@typescript-eslint/website-eslint';

import useFocus from '../hooks/useFocus';
import reducerRules, { RuleModel } from '../hooks/reducerRules';

import Modal from './Modal';
import Checkbox from '../inputs/Checkbox';

import styles from './ModalEslint.module.css';
import reducerConfig, {
  buildRulesRecord,
} from '@site/src/components/hooks/reducerConfig';

export interface ModalEslintProps {
  readonly isOpen: boolean;
  readonly onClose: (rules: RulesRecord) => void;
  readonly ruleOptions: string[];
  readonly rules: RulesRecord;
}

function filterRules(rules: RuleModel[], name: string): RuleModel[] {
  return rules.filter(item => item.name.includes(name));
}

function ModalEslint(props: ModalEslintProps): JSX.Element {
  const [filter, setFilter] = useState<string>('');
  const [editJson, setEditJson] = useState<boolean>(false);
  const [rules, updateRules] = useReducer(reducerRules, []);
  const [rulesCode, setRulesCode] = useReducer(reducerConfig, '');
  const [filterInput, setFocus] = useFocus();

  useEffect(() => {
    updateRules({
      type: 'init',
      rules: props.rules,
      ruleOptions: props.ruleOptions,
    });
  }, [props.rules, props.ruleOptions]);

  useEffect(() => {
    if (!editJson && props.isOpen) {
      setFocus();
    }
  }, [editJson, props.isOpen]);

  const changeEditType = useCallback(() => {
    if (editJson) {
      updateRules({
        type: 'json',
        code: rulesCode,
        ruleOptions: props.ruleOptions,
      });
    } else {
      setFocus();
      setRulesCode(rules);
    }
    setEditJson(!editJson);
  }, [editJson, rules, rulesCode]);

  const onClose = useCallback(() => {
    props.onClose(buildRulesRecord(rules));
  }, [props, rules]);

  return (
    <Modal header="Eslint Config" isOpen={props.isOpen} onClose={onClose}>
      <>
        <div className={styles.topBar}>
          {!editJson && (
            <input
              ref={filterInput}
              type="text"
              key="eslint-filter"
              className={styles.search}
              onInput={(e): void => setFilter(e.target.value)}
            />
          )}
          <button
            className={clsx('button button--info button--sm', styles.editJson)}
            onClick={changeEditType}
          >
            {!editJson ? 'Edit JSON' : 'Edit Rules'}
          </button>
        </div>
        {editJson && (
          <textarea
            name="eslint-edit-json"
            className={styles.textarea}
            value={rulesCode}
            onChange={(e): void => setRulesCode(e.target.value)}
            rows={20}
          />
        )}
        {!editJson && (
          <div className={clsx('thin-scrollbar', styles.searchResultContainer)}>
            {filterRules(rules, filter).map((item, index) => (
              <label className={styles.searchResult} key={item.name}>
                {item.name}
                <Checkbox
                  name={`eslint_rule_${index}`}
                  value={item.name}
                  indeterminate={item.isCustom}
                  checked={item.isEnabled}
                  onChange={(checked, name): void =>
                    updateRules({ type: 'toggle', checked, name })
                  }
                />
              </label>
            ))}
          </div>
        )}
      </>
    </Modal>
  );
}

export default ModalEslint;
