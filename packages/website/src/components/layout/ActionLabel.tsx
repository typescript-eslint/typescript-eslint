import React from 'react';

import styles from './InputLabel.module.css';

export interface InputLabelProps {
  readonly name: string;
  readonly children: React.ReactNode;
  readonly onClick: () => void;
}

function ActionLabel(props: InputLabelProps): JSX.Element {
  return (
    <button onClick={props.onClick} className={styles.optionLabel}>
      <span>{props.name}</span>
      {props.children}
    </button>
  );
}

export default ActionLabel;
