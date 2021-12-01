import React, { MouseEvent } from 'react';
import clsx from 'clsx';
import styles from './ASTViewer.module.css';

export interface PropertyNameProps {
  readonly name?: string;
  readonly propName?: string;
  readonly onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function PropertyName(props: PropertyNameProps): JSX.Element {
  return (
    <>
      {props.propName && (
        <button
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          onClick={props.onClick}
          className={clsx(styles.propName, styles.clickable)}
        >
          {props.propName}
        </button>
      )}
      {props.propName && <span>: </span>}
      {props.name && (
        <button
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          onClick={props.onClick}
          className={clsx(styles.tokenName, styles.clickable)}
        >
          {props.name}
        </button>
      )}
    </>
  );
}
