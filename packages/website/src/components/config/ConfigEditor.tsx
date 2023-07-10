import clsx from 'clsx';
import React, { useCallback, useMemo, useState } from 'react';

import Checkbox from '../inputs/Checkbox';
import Dropdown from '../inputs/Dropdown';
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
  readonly onChange: (config: ConfigEditorValues) => void;
  readonly className?: string;
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

function ConfigEditor({
  onChange: onChangeProp,
  values,
  options,
  className,
}: ConfigEditorProps): JSX.Element {
  const [filter, setFilter] = useState<string>('');

  const filteredOptions = useMemo(() => {
    return filterConfig(options, filter);
  }, [options, filter]);

  const onChange = useCallback(
    (name: string, value: unknown): void => {
      const newConfig = { ...values };
      if (value === '' || value == null) {
        delete newConfig[name];
      } else {
        newConfig[name] = value;
      }
      onChangeProp(newConfig);
    },
    [values, onChangeProp],
  );

  return (
    <div
      className={clsx(
        'thin-scrollbar',
        styles.searchResultContainer,
        className,
      )}
    >
      <div className={styles.searchBar}>
        <Text
          type="search"
          name="config-filter"
          value={filter}
          onChange={setFilter}
        />
      </div>
      {filteredOptions.map(group => (
        <div key={group.heading}>
          <h3 className={styles.searchResultGroup}>{group.heading}</h3>
          <div>
            {group.fields.map(item => (
              <ConfigEditorField
                key={item.key}
                item={item}
                value={values[item.key]}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConfigEditor;
