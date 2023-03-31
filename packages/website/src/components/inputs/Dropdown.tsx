import clsx from 'clsx';
import React from 'react';

import styles from './Dropdown.module.css';

export interface DropdownOption<T> {
  readonly value: T;
  readonly label: string;
}

export interface DropdownProps<T> {
  readonly onChange: (value: T) => void;
  readonly options: readonly (DropdownOption<T> | T)[];
  readonly value: T | undefined;
  readonly name: string;
  readonly className?: string;
  readonly disabled?: boolean;
}

function Dropdown<T extends boolean | string | number>(
  props: DropdownProps<T>,
): JSX.Element {
  const options: DropdownOption<T>[] = props.options.map(option =>
    typeof option !== 'object'
      ? { label: String(option), value: option }
      : option,
  );

  return (
    <select
      className={clsx(styles.dropdown, props.className)}
      name={props.name}
      disabled={props.disabled}
      value={String(props.value)}
      onChange={(e): void => {
        const selected = options.find(
          item => String(item.value) === e.target.value,
        );
        if (selected) {
          props.onChange(selected.value);
        }
      }}
    >
      {options.map(item => (
        <option key={String(item.value)} value={String(item.value)}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
