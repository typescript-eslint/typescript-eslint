import React, { SyntheticEvent } from 'react';
import clsx from 'clsx';
import styles from './ASTViewer.module.css';

export default function PropertyName(props: {
  name?: string;
  propName?: string;
  onClick?: (e: SyntheticEvent) => void;
  onMouseEnter?: (e: SyntheticEvent) => void;
}): JSX.Element {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <span onClick={props.onClick} onMouseEnter={props.onMouseEnter}>
      {props.propName && (
        <span className={clsx(styles.propName, styles.clickable)}>
          {props.propName}
        </span>
      )}
      {props.propName && <span>: </span>}
      {props.name && (
        <span className={clsx(styles.tokenName, styles.clickable)}>
          {props.name}
        </span>
      )}
    </span>
  );
}
