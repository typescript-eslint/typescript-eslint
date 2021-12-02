import React, { useEffect, useState } from 'react';
import styles from '@site/src/components/ast/ASTViewer.module.css';
import PropertyValue from '@site/src/components/ast/PropertyValue';

export interface HiddenItemProps {
  readonly value: [string, unknown][];
  readonly level: string;
  readonly isArray?: boolean;
}

export default function HiddenItem(props: HiddenItemProps): JSX.Element {
  const [isComplex, setIsComplex] = useState<boolean>(true);

  useEffect(() => {
    setIsComplex(
      Boolean(
        props.isArray &&
          props.value.some(
            item => typeof item[1] === 'object' && item[1] !== null,
          ),
      ),
    );
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
          {props.value.length} {props.value.length > 1 ? 'elements' : 'element'}
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
