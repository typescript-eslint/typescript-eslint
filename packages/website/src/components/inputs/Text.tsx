import SearchIcon from '@site/src/icons/search.svg';
import React from 'react';

import styles from './Text.module.css';

export interface DropdownProps {
  readonly onChange: (value: string) => void;
  readonly value: string;
  readonly name: string;
  readonly className?: string;
  readonly type?: 'search' | 'text';
  readonly placeholder?: string;
}

// eslint-disable-next-line react/display-name
const Text = React.forwardRef<HTMLInputElement, DropdownProps>(
  (props, ref): React.JSX.Element => {
    return (
      <>
        <label className={styles.textInput}>
          {props.type === 'search' && <SearchIcon />}
          <input
            value={props.value}
            onChange={(e): void => {
              props.onChange(e.target.value);
            }}
            name={props.name}
            className={props.className}
            type={props.type ?? 'text'}
            autoComplete="off"
            placeholder={props.placeholder}
            ref={ref}
          />
        </label>
      </>
    );
  },
);

export default Text;
