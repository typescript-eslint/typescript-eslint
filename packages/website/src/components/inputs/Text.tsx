import SearchIcon from '@site/src/icons/search.svg';
import React from 'react';

import styles from './Text.module.css';

export interface DropdownProps {
  readonly className?: string;
  readonly name: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly type?: 'search' | 'text';
  readonly value: string;
}

const Text = React.forwardRef<HTMLInputElement, DropdownProps>(
  (props, ref): React.JSX.Element => {
    return (
      <>
        <label className={styles.textInput}>
          {props.type === 'search' && <SearchIcon />}
          <input
            autoComplete="off"
            className={props.className}
            name={props.name}
            onChange={(e): void => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            ref={ref}
            type={props.type ?? 'text'}
            value={props.value}
          />
        </label>
      </>
    );
  },
);

export default Text;
