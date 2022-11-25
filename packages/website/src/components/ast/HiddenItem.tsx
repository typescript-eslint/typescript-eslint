import React, { useEffect, useState } from 'react';

import styles from './ASTViewer.module.css';
import PropertyValue from './PropertyValue';
import type { ASTViewerModelMap } from './types';

export interface HiddenItemProps {
  readonly value: ASTViewerModelMap[];
  readonly level: string;
  readonly isArray?: boolean;
}

export default function HiddenItem({
  value,
  level,
  isArray,
}: HiddenItemProps): JSX.Element {
  const [isComplex, setIsComplex] = useState<boolean>(true);
  const [length, setLength] = useState<number>(0);

  useEffect(() => {
    if (isArray) {
      const filtered = value.filter(item => !isNaN(Number(item.key)));
      setIsComplex(filtered.some(item => item.model.type !== 'number'));
      setLength(filtered.length);
    }
  }, [value, isArray]);

  return (
    <span className={styles.hidden}>
      {isArray && !isComplex ? (
        value.map((item, index) => (
          <span key={`${level}_[${index}]`}>
            {index > 0 && ', '}
            <PropertyValue value={item} />
          </span>
        ))
      ) : isArray ? (
        <>
          {length} {length === 1 ? 'element' : 'elements'}
        </>
      ) : (
        value.map((item, index) => (
          <span key={`${level}_[${index}]`}>
            {index > 0 && ', '}
            {String(item.key)}
          </span>
        ))
      )}
    </span>
  );
}
