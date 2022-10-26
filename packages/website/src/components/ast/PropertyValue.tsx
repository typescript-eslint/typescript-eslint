import React from 'react';

import styles from './ASTViewer.module.css';
import type { ASTViewerModelMap } from './types';

export interface PropertyValueProps {
  readonly value: ASTViewerModelMap;
}

function PropertyValue({ value }: PropertyValueProps): JSX.Element {
  switch (value.model.type) {
    case 'string':
      return <span className={styles.propString}>{value.model.value}</span>;
    case 'bigint':
      return <span className={styles.propNumber}>{value.model.value}</span>;
    case 'number':
      return <span className={styles.propNumber}>{value.model.value}</span>;
    case 'regexp':
      return <span className={styles.propRegExp}>{value.model.value}</span>;
    case 'undefined':
      return <span className={styles.propEmpty}>{value.model.value}</span>;
    case 'boolean':
      return <span className={styles.propBoolean}>{value.model.value}</span>;
    case 'array':
    case 'object':
      return <span className={styles.propClass}>{value.key}</span>;
    case 'class':
    case 'ref':
    default:
      return <span className={styles.propClass}>{value.model.value}</span>;
  }
}

export default PropertyValue;
