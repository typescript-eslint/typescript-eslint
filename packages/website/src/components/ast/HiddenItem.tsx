import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';
import PropertyValue from './PropertyValue';

export interface HiddenItemProps {
  readonly value: [string, unknown][];
  readonly level: string;
  readonly isArray?: boolean;
}

export default function HiddenItem(props: HiddenItemProps): JSX.Element {
  const [isComplex, setIsComplex] = useState<boolean>(true);
  const [length, setLength] = useState<number>(0);

  useEffect(() => {
    if (props.isArray) {
      const filtered = props.value.filter(item => !isNaN(Number(item[0])));
      setIsComplex(
        !filtered.some(item => typeof item[1] !== 'object' || item[1] === null),
      );
      setLength(filtered.length);
    }
  }, [props.value, props.isArray]);

  return (
    <span className={styles.hidden}>
      {props.isArray && !isComplex ? (
        props.value.map((item, index) => (
          <span key={`${props.level}_[${index}]`}>
            {index > 0 && ', '}
            <PropertyValue value={item[1]} />
          </span>
        ))
      ) : props.isArray ? (
        <>
          {length} {length === 1 ? 'element' : 'elements'}
        </>
      ) : (
        props.value.map((item, index) => (
          <span key={`${props.level}_[${index}]`}>
            {index > 0 && ', '}
            {String(item[0])}
          </span>
        ))
      )}
    </span>
  );
}
