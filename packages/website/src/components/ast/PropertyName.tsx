import React, { MouseEvent } from 'react';
import styles from './ASTViewer.module.css';

export interface PropertyNameProps {
  readonly typeName?: string;
  readonly propName?: string;
  readonly onClick?: (e: MouseEvent<HTMLElement>) => void;
  readonly onMouseEnter?: (e: boolean) => void;
  readonly onMouseLeave?: (e: boolean) => void;
}

export default function PropertyName(props: PropertyNameProps): JSX.Element {
  return props.onClick || props.onMouseEnter || props.onMouseLeave ? (
    <>
      {props.propName && (
        <a
          href={`#${props.propName}`}
          onMouseEnter={(): void => props.onMouseEnter?.(true)}
          onMouseLeave={(): void => props.onMouseLeave?.(false)}
          onClick={(e): void => {
            e.preventDefault();
            props.onClick?.(e);
          }}
          className={styles.propName}
        >
          {props.propName}
        </a>
      )}
      {props.propName && <span>: </span>}
      {props.typeName && (
        <a
          href={`#${props.typeName}`}
          onMouseEnter={(): void => props.onMouseEnter?.(true)}
          onMouseLeave={(): void => props.onMouseLeave?.(false)}
          onClick={(e): void => {
            e.preventDefault();
            props.onClick?.(e);
          }}
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
