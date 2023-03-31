import Dropdown from '@site/src/components/inputs/Dropdown';
import Modal from '@site/src/components/layout/Modal';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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

interface ConfigEditorFieldProps {
  readonly item: ConfigOptionsField;
  readonly value: unknown;
  readonly onChange: (name: string, value: unknown) => void;
}

function ConfigEditorField({
  item,
  value,
  onChange,
}: ConfigEditorFieldProps): JSX.Element {
  return (
    <label className={styles.searchResult}>
      <span className={styles.searchResultDescription}>
        <span className={styles.searchResultName}>{item.key}</span>
        {item.label && <br />}
        {item.label && <span> {item.label}</span>}
      </span>
      {(item.type === 'boolean' && (
        <Checkbox
          name={`config_${item.key}`}
          value={item.key}
          indeterminate={Boolean(value) && !isDefault(value, item.defaults)}
          checked={Boolean(value)}
          onChange={(checked): void =>
            onChange(item.key, checked ? item.defaults?.[0] ?? true : undefined)
          }
        />
      )) ||
        (item.type === 'string' && item.enum && (
          <Dropdown
            name={`config_${item.key}`}
            value={String(value)}
            options={item.enum}
            onChange={(value): void => onChange(item.key, value)}
          />
        ))}
    </label>
  );
}

function ConfigEditor(props: ConfigEditorProps): JSX.Element {
  const { onClose: onCloseProps, isOpen, values, options, header } = props;
  const [filter, setFilter] = useState<string>('');
  const [config, setConfig] = useState<ConfigEditorValues>(() => ({}));
  const [filterInput, setFilterFocus] = useFocus<HTMLInputElement>();

  const filteredOptions = useMemo(
    () => filterConfig(options, filter),
    [options, filter],
  );

  const onClose = useCallback(() => {
    onCloseProps(config);
  }, [onCloseProps, config]);

  const onChange = useCallback(
    (name: string, value: unknown): void => {
      setConfig(oldConfig => {
        const newConfig = { ...oldConfig };
        if (value === '' || value == null) {
          delete newConfig[name];
        } else {
          newConfig[name] = value;
        }
        return newConfig;
      });
    },
    [setConfig],
  );

  useEffect(() => {
    setConfig(values);
  }, [values]);

  useEffect(() => {
    if (isOpen) {
      setFilterFocus();
    }
  }, [isOpen, setFilterFocus]);

  return (
    <Modal header={header} isOpen={isOpen} onClose={onClose}>
      <div className={styles.searchBar}>
        <Text
          ref={filterInput}
          type="search"
          name="config-filter"
          value={filter}
          onChange={setFilter}
        />
      </div>
      <div className={clsx('thin-scrollbar', styles.searchResultContainer)}>
        {isOpen &&
          filteredOptions.map(group => (
            <div key={group.heading}>
              <h3 className={styles.searchResultGroup}>{group.heading}</h3>
              <div>
                {group.fields.map(item => (
                  <ConfigEditorField
                    key={item.key}
                    item={item}
                    value={config[item.key]}
                    onChange={onChange}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </Modal>
  );
}

export default ConfigEditor;
