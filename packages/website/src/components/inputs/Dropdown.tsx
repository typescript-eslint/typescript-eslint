import clsx from 'clsx';
import React from 'react';

import styles from './Dropdown.module.css';

export interface DropdownOption<T> {
  readonly label: string;
  readonly value: T;
}

export interface DropdownProps<T> {
  readonly className?: string;
  readonly disabled?: boolean;
  readonly name: string;
  readonly onChange: (value: T) => void;
  readonly options: readonly (DropdownOption<T> | T)[];
  readonly value: T | undefined;
}

function Dropdown<T extends boolean | number | string>(
  props: DropdownProps<T>,
): React.JSX.Element {
  const options: DropdownOption<T>[] = props.options.map(option =>
    typeof option !== 'object'
      ? { label: String(option), value: option }
      : option,
  );

  return (
    <select
      className={clsx(styles.dropdown, props.className)}
      disabled={props.disabled}
      name={props.name}
      onChange={(e): void => {
        const selected = options.find(
          item => String(item.value) === e.target.value,
        );
        if (selected) {
          props.onChange(selected.value);
        }
      }}
      value={String(props.value)}
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
