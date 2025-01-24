import clsx from 'clsx';
import React, { useCallback, useMemo, useState } from 'react';

import Checkbox from '../inputs/Checkbox';
import Dropdown from '../inputs/Dropdown';
import Text from '../inputs/Text';
import styles from './ConfigEditor.module.css';

export interface ConfigOptionsField {
  defaults?: unknown[];
  enum?: string[];
  key: string;
  label?: string;
  type: 'boolean' | 'string';
}

export interface ConfigOptionsType {
  fields: ConfigOptionsField[];
  heading: string;
}

export type ConfigEditorValues = Record<string, unknown>;

export interface ConfigEditorProps {
  readonly className?: string;
  readonly onChange: (config: ConfigEditorValues) => void;
  readonly options: ConfigOptionsType[];
  readonly values: ConfigEditorValues;
}

function filterConfig(
  options: ConfigOptionsType[],
  filter: string,
): ConfigOptionsType[] {
  return options
    .map(group => ({
      fields: group.fields.filter(item =>
        String(item.key.toLowerCase()).includes(filter.toLowerCase()),
      ),
      heading: group.heading,
    }))
    .filter(group => group.fields.length > 0);
}

function isDefault(value: unknown, defaults?: unknown[]): boolean {
  return defaults ? defaults.includes(value) : value === true;
}

interface ConfigEditorFieldProps {
  readonly item: ConfigOptionsField;
  readonly onChange: (name: string, value: unknown) => void;
  readonly value: unknown;
}

function ConfigEditorField({
  item,
  onChange,
  value,
}: ConfigEditorFieldProps): React.JSX.Element {
  return (
    <label className={styles.searchResult}>
      <span className={styles.searchResultDescription}>
        <span className={styles.searchResultName}>{item.key}</span>
        {item.label && <br />}
        {item.label && <span> {item.label}</span>}
      </span>
      {item.type === 'boolean' ? (
        <Checkbox
          checked={Boolean(value)}
          indeterminate={Boolean(value) && !isDefault(value, item.defaults)}
          name={`config_${item.key}`}
          onChange={(checked): void =>
            onChange(
              item.key,
              checked ? (item.defaults?.[0] ?? true) : undefined,
            )
          }
          value={item.key}
        />
      ) : (
        item.enum && (
          <Dropdown
            name={`config_${item.key}`}
            onChange={(value): void => onChange(item.key, value)}
            options={item.enum}
            value={String(value)}
          />
        )
      )}
    </label>
  );
}

function ConfigEditor({
  className,
  onChange: onChangeProp,
  options,
  values,
}: ConfigEditorProps): React.JSX.Element {
  const [filter, setFilter] = useState<string>('');

  const filteredOptions = useMemo(() => {
    return filterConfig(options, filter);
  }, [options, filter]);

  const onChange = useCallback(
    (name: string, value: unknown): void => {
      const newConfig = { ...values };
      if (value === '' || value == null) {
        // Filter out falsy values from the new config
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
          name="config-filter"
          onChange={setFilter}
          type="search"
          value={filter}
        />
      </div>
      {filteredOptions.map(group => (
        <div key={group.heading}>
          <h3 className={styles.searchResultGroup}>{group.heading}</h3>
          <div>
            {group.fields.map(item => (
              <ConfigEditorField
                item={item}
                key={item.key}
                onChange={onChange}
                value={values[item.key]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConfigEditor;
