import React, { useCallback, useEffect, useReducer, useState } from 'react';
import clsx from 'clsx';

import styles from './ConfigEditor.module.css';

import Text from '../inputs/Text';
import Checkbox from '../inputs/Checkbox';
import useFocus from '../hooks/useFocus';
import Modal from '@site/src/components/modals/Modal';

export interface ConfigOptionsField {
  key: string;
  label?: string;
  defaults?: unknown[];
}

export interface ConfigOptionsType {
  heading: string;
  fields: ConfigOptionsField[];
}

export type ConfigEditorValues = Record<string, unknown>;

export interface ConfigEditorProps {
  readonly options: ConfigOptionsType[];
  readonly values: ConfigEditorValues;
  readonly isOpen: boolean;
  readonly header: string;
  readonly onClose: (config: ConfigEditorValues) => void;
}

function reducerObject(
  state: ConfigEditorValues,
  action:
    | { type: 'init'; config?: ConfigEditorValues }
    | {
        type: 'toggle';
        checked: boolean;
        default: unknown[] | undefined;
        name: string;
      },
): ConfigEditorValues {
  switch (action.type) {
    case 'init': {
      return action.config ?? {};
    }
    case 'toggle': {
      const newState = { ...state };
      if (action.checked) {
        newState[action.name] = action.default ? action.default[0] : true;
      } else if (action.name in newState) {
        delete newState[action.name];
      }
      return newState;
    }
  }
}

function filterConfig(
  options: ConfigOptionsType[],
  filter: string,
): ConfigOptionsType[] {
  return options
    .map(group => ({
      heading: group.heading,
      fields: group.fields.filter(item => String(item.key).includes(filter)),
    }))
    .filter(group => group.fields.length > 0);
}

function isDefault(value: unknown, defaults?: unknown[]): boolean {
  return defaults ? defaults.includes(value) : value === true;
}

function ConfigEditor(props: ConfigEditorProps): JSX.Element {
  const [filter, setFilter] = useState<string>('');
  const [config, setConfig] = useReducer(reducerObject, {});
  const [filterInput, setFilterFocus] = useFocus();

  const onClose = useCallback(() => {
    props.onClose(config);
  }, [props.onClose, config]);

  useEffect(() => {
    setConfig({ type: 'init', config: props.values });
  }, [props.values]);

  useEffect(() => {
    if (props.isOpen) {
      setFilterFocus();
    }
  }, [props.isOpen]);

  return (
    <Modal header={props.header} isOpen={props.isOpen} onClose={onClose}>
      <div className={styles.searchBar}>
        <Text
          ref={filterInput}
          type="text"
          name="config-filter"
          value={filter}
          className={styles.search}
          onChange={setFilter}
        />
      </div>
      <div className={clsx('thin-scrollbar', styles.searchResultContainer)}>
        {filterConfig(props.options, filter).map(group => (
          <div key={group.heading}>
            <h3 className={styles.searchResultGroup}>{group.heading}</h3>
            <div>
              {group.fields.map(item => (
                <label className={styles.searchResult} key={item.key}>
                  <span>
                    <span className={styles.searchResultName}>{item.key}</span>
                    {item.label && <br />}
                    {item.label && <span>{item.label}</span>}
                  </span>
                  <Checkbox
                    name={`config_${item.key}`}
                    value={item.key}
                    indeterminate={
                      Boolean(config[item.key]) &&
                      !isDefault(config[item.key], item.defaults)
                    }
                    checked={Boolean(config[item.key])}
                    onChange={(checked, name): void =>
                      setConfig({
                        type: 'toggle',
                        checked,
                        default: item.defaults,
                        name,
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default ConfigEditor;
