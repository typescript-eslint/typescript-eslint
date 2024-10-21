import React from 'react';

import styles from './InputLabel.module.css';

export interface InputLabelProps {
  readonly children: React.ReactNode;
  readonly name: string;
}

function InputLabel(props: InputLabelProps): React.JSX.Element {
  return (
    <label className={styles.optionLabel}>
      <span>{props.name}</span>
      {props.children}
    </label>
  );
}

export default InputLabel;
