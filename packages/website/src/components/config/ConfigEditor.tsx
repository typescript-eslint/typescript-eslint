import Dropdown from '@site/src/components/inputs/Dropdown';
import Modal from '@site/src/components/layout/Modal';
import clsx from 'clsx';
import React, { useCallback, useEffect, useReducer, useState } from 'react';

import useFocus from '../hooks/useFocus';
import Checkbox from '../inputs/Checkbox';
import Text from '../inputs/Text';
import styles from './ConfigEditor.module.css';

export interface ConfigOptionsField {
  key: string;
  type: 'boolean' | 'string';
  label?: string;
  defaults?: unknown[];
  enum?: string[];
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
        type: 'set';
        name: string;
        value: unknown;
      }
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
    case 'set': {
      const newState = { ...state };
      if (action.value === '') {
        delete newState[action.name];
      } else {
        newState[action.name] = action.value;
      }
      return newState;
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
  const { onClose: onCloseProps, isOpen, values } = props;
  const [filter, setFilter] = useState<string>('');
  const [config, setConfig] = useReducer(reducerObject, {});
  const [filterInput, setFilterFocus] = useFocus<HTMLInputElement>();

  const onClose = useCallback(() => {
    onCloseProps(config);
  }, [onCloseProps, config]);

  useEffect(() => {
    setConfig({ type: 'init', config: values });
  }, [values]);

  useEffect(() => {
    if (isOpen) {
      setFilterFocus();
    }
  }, [isOpen, setFilterFocus]);

  return (
    <Modal header={props.header} isOpen={isOpen} onClose={onClose}>
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
                  <span className={styles.searchResultDescription}>
                    <span className={styles.searchResultName}>{item.key}</span>
                    {item.label && (
                      <>
                        <br />
                        <span> {item.label}</span>
                      </>
                    )}
                  </span>
                  {item.type === 'boolean' && (
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
                  )}
                  {item.type === 'string' && item.enum && (
                    <Dropdown
                      name={`config_${item.key}`}
                      value={String(config[item.key])}
                      options={item.enum}
                      onChange={(value): void => {
                        setConfig({
                          type: 'set',
                          value,
                          name: item.key,
                        });
                      }}
                    />
                  )}
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
