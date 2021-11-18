import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import type { RulesRecord, RuleEntry } from '@typescript-eslint/website-eslint';

import useFocus from '../hooks/useFocus';

import Modal from './Modal';
import Checkbox from '../inputs/Checkbox';

import styles from './ModalEslint.module.css';

interface ModalEslintProps {
  isOpen: boolean;
  onClose: (rules: RulesRecord) => void;
  ruleOptions: string[];
  rules: RulesRecord;
}

interface RuleModel {
  name: string;
  isEnabled: boolean;
  isCustom: boolean;
  value: RuleEntry;
}

function mapRecords(rules: RulesRecord): RuleModel[] {
  return Object.entries(rules).map<RuleModel>(item => {
    const value = item[1]!;
    return {
      name: item[0],
      isEnabled:
        value !== 0 &&
        value !== 'off' &&
        !(Array.isArray(value) && (value[0] === 'off' || value[0] === 0)),
      isCustom: value === 1 || (Array.isArray(value) && value.length > 1),
      value: value,
    };
  });
}

function buildRules(rules: RulesRecord, ruleOptions: string[]): RuleModel[] {
  return mapRecords({
    ...ruleOptions.reduce<RulesRecord>((acc, item) => {
      acc[item] = 0;
      return acc;
    }, {}),
    ...rules,
  }).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

function buildRulesRecord(rules: RuleModel[], short = true): RulesRecord {
  const ruleError = short ? 2 : 'error';
  const ruleOff = short ? 0 : 'off';
  return rules
    .filter(item => item.isEnabled || item.isCustom)
    .reduce((acc, item) => {
      acc[item.name] = item.isCustom
        ? item.value
        : item.isEnabled
        ? ruleError
        : ruleOff;
      return acc;
    }, {});
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return Boolean(data && typeof data === 'object');
}

function filterRules(rules: RuleModel[], name: string): RuleModel[] {
  return rules.filter(item => item.name.includes(name));
}

function ModalEslint(props: ModalEslintProps): JSX.Element {
  const [filter, setFilter] = useState<string>('');
  const [editJson, setEditJson] = useState<boolean>(false);
  const [rules, setRules] = useState<RuleModel[]>([]);
  const [rulesCode, setRulesCode] = useState<string>('');
  const [filterInput, setFocus] = useFocus();

  useEffect(() => {
    setRules(buildRules(props.rules ?? {}, props.ruleOptions ?? []));
  }, [props.rules, props.ruleOptions]);

  useEffect(() => {
    if (!editJson && props.isOpen) {
      setFocus();
    }
  }, [editJson, props.isOpen]);

  const updateRule = useCallback(
    (checked: boolean, name: string) => {
      setRules(
        rules.map(item => {
          if (item.name === name) {
            item.isEnabled = checked;
            item.isCustom = false;
          }
          return item;
        }),
      );
    },
    [rules],
  );

  const changeEditType = useCallback(() => {
    if (editJson) {
      try {
        const data: unknown = JSON.parse(rulesCode);
        if (isRecord(data) && 'rules' in data && isRecord(data.rules)) {
          // @ts-expect-error: unsafe code
          const parsed = buildRules(data.rules, props.ruleOptions ?? []);
          setRules(parsed);
        }
      } catch {
        console.error('ERROR parsing json');
      }
    } else {
      setFocus();
      setRulesCode(
        JSON.stringify(
          {
            rules: buildRulesRecord(rules, false),
          },
          null,
          2,
        ),
      );
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
                  onChange={updateRule}
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
