import clsx from 'clsx';
import type { Selector } from 'esquery';
import React, { useEffect, useState } from 'react';

import { ErrorViewer } from './ErrorsViewer';
import styles from './ESQueryFilter.module.css';
import Text from './inputs/Text';

export interface ESQueryFilterProps {
  readonly onChange: (value?: Selector) => void;
}

export function ESQueryFilter({ onChange }: ESQueryFilterProps): JSX.Element {
  const [esQueryError, setEsQueryError] = useState<Error>();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    onChange(undefined);
  }, [onChange]);

  const changeEvent = (value: string): void => {
    setInputValue(value);
    try {
      const queryParsed = window.esquery.parse(value);
      onChange(queryParsed);
      setEsQueryError(undefined);
    } catch (e: unknown) {
      setEsQueryError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  return (
    <>
      <div className={clsx(styles.searchContainer, 'margin-bottom--xs')}>
        <Text
          value={inputValue}
          type="search"
          name="esquery"
          onChange={changeEvent}
          placeholder="ESQuery filter"
        />
      </div>
      {esQueryError && (
        <ErrorViewer
          type="warning"
          title="Invalid Selector"
          value={esQueryError}
        />
      )}
    </>
  );
}
