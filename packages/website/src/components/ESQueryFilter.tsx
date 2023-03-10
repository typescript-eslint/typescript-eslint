import type { Selector } from 'esquery';
import React, { useState } from 'react';

import styles from './ESQueryFilter.module.css';
import Text from './inputs/Text';

export interface ESQueryFilterProps {
  readonly onChange: (value: Selector) => void;
  readonly onError: (value?: Error) => void;
}

export function ESQueryFilter({
  onChange,
  onError,
}: ESQueryFilterProps): JSX.Element {
  const [value, setValue] = useState('');
  const changeEvent = (value: string): void => {
    setValue(value);
    try {
      const queryParsed = window.esquery.parse(value);
      onChange(queryParsed);
      onError(undefined);
    } catch (e: unknown) {
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  return (
    <div className={styles.searchContainer}>
      <Text
        value={value}
        type="search"
        name="esquery"
        onChange={changeEvent}
        placeholder="ESQuery filter"
      />
    </div>
  );
}
