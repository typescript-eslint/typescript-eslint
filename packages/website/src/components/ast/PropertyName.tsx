import React, { MouseEvent } from 'react';
import styles from './ASTViewer.module.css';

export interface PropertyNameProps {
  readonly typeName?: string;
  readonly propName?: string;
  readonly onClick?: (e: MouseEvent<HTMLElement>) => void;
  readonly onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  readonly onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
}

export default function PropertyName(props: PropertyNameProps): JSX.Element {
  return props.onClick ? (
    <>
      {props.propName && (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          href="javascript:void(0)"
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          onClick={props.onClick}
          className={styles.propName}
        >
          {props.propName}
        </a>
      )}
      {props.propName && <span>: </span>}
      {props.typeName && (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          href="javascript:void(0)"
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          onClick={props.onClick}
          className={styles.tokenName}
        >
          {props.typeName}
        </a>
      )}
      {props.typeName && <span> </span>}
    </>
  ) : (
    <>
      {props.propName && (
        <span className={styles.propName}>{props.propName}</span>
      )}
      {props.propName && <span>: </span>}
      {props.typeName && (
        <span className={styles.tokenName}>{props.typeName}</span>
      )}
      {props.typeName && <span> </span>}
    </>
  );
}
