import React from 'react';
import styles from './ASTViewer.module.css';
import type { ASTViewerModel } from './types';

export interface PropertyValueProps {
  readonly value: ASTViewerModel;
}

function PropertyValue({ value }: PropertyValueProps): JSX.Element {
  switch (value.type) {
    case 'string':
      return <span className={styles.propString}>{value.value}</span>;
    case 'bigint':
      return <span className={styles.propNumber}>{value.value}</span>;
    case 'number':
      return <span className={styles.propNumber}>{value.value}</span>;
    case 'regexp':
      return <span className={styles.propRegExp}>{value.value}</span>;
    case 'undefined':
      return <span className={styles.propEmpty}>{value.value}</span>;
    case 'boolean':
      return <span className={styles.propBoolean}>{value.value}</span>;
    case 'array':
    case 'object':
      return <span className={styles.propClass}>{value.key}</span>;
    case 'class':
    case 'ref':
    default:
      return <span className={styles.propClass}>{value.value}</span>;
  }
}

export default PropertyValue;
