import React from 'react';

import styles from './InputLabel.module.css';

export interface InputLabelProps {
  readonly children: React.ReactNode;
  readonly name: string;
  readonly onClick: () => void;
}

function ActionLabel(props: InputLabelProps): React.JSX.Element {
  return (
    <button className={styles.optionLabel} onClick={props.onClick}>
      <span>{props.name}</span>
      {props.children}
    </button>
  );
}

export default ActionLabel;
