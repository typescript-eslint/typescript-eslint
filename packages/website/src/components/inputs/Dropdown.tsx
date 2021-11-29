import React from 'react';
import styles from '../OptionsSelector.module.css';
import clsx from 'clsx';

export interface DropdownProps {
  readonly onChange: (value: string) => void;
  readonly options: string[];
  readonly value: string | undefined;
  readonly name: string;
  readonly className?: string;
}

function Dropdown(props: DropdownProps): JSX.Element {
  return (
    <select
      name={props.name}
      value={props.value}
      className={clsx(styles.optionSelect, props.className)}
      onChange={(e): void => {
        props.onChange(e.target.value);
      }}
    >
      {props.options.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
