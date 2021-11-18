import styles from './ast-viewer.module.css';
import React from 'react';

export default function PropertyValue(props: { value: unknown }): JSX.Element {
  if (typeof props.value === 'string') {
    return (
      <span className={styles.propString}>{JSON.stringify(props.value)}</span>
    );
  } else if (typeof props.value === 'number') {
    return <span className={styles.propNumber}>{props.value}</span>;
  } else if (typeof props.value === 'bigint') {
    return <span className={styles.propNumber}>{String(props.value)}n</span>;
  } else if (typeof props.value === 'boolean') {
    return (
      <span className={styles.propBoolean}>
        {props.value ? 'true' : 'false'}
      </span>
    );
  }
  return <span>{String(props.value)}</span>;
}
