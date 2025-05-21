import type { Selector } from 'esquery';

import React, { useState } from 'react';

import styles from './ESQueryFilter.module.css';
import Text from './inputs/Text';

export interface ESQueryFilterProps {
  defaultValue?: string;
  readonly onChange: (filter: string, selector: Selector) => void;
  readonly onError: (value?: Error) => void;
}

export function ESQueryFilter({
  defaultValue,
  onChange,
  onError,
}: ESQueryFilterProps): React.JSX.Element {
  const [value, setValue] = useState(defaultValue ?? '');
  const changeEvent = (value: string): void => {
    setValue(value);
    try {
      const queryParsed = window.esquery.parse(value);
      onChange(value, queryParsed);
      onError(undefined);
    } catch (e: unknown) {
      onError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  return (
    <div className={styles.searchContainer}>
      <Text
        name="esquery"
        onChange={changeEvent}
        placeholder="ESQuery filter"
        type="search"
        value={value}
      />
    </div>
  );
}
