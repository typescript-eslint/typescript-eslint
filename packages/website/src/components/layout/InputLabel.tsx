import React from 'react';

import styles from './InputLabel.module.css';

export interface InputLabelProps {
  readonly name: string;
  readonly children: React.ReactNode;
}

function InputLabel(props: InputLabelProps): JSX.Element {
  return (
    <label className={styles.optionLabel}>
      <span>{props.name}</span>
      {props.children}
    </label>
  );
}

export default InputLabel;
