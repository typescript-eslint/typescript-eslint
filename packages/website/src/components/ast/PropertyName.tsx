import Link from '@docusaurus/Link';
import type { MouseEvent } from 'react';
import React, { useCallback } from 'react';

import styles from './ASTViewer.module.css';

export interface PropertyNameProps {
  readonly typeName?: string;
  readonly propName?: string;
  readonly onClick?: (e: MouseEvent<HTMLElement>) => void;
  readonly onClickType?: (e: MouseEvent<HTMLElement>) => void;
  readonly onHover?: (e: boolean) => void;
}

export default function PropertyName(props: PropertyNameProps): JSX.Element {
  const {
    onClick: onClickProps,
    onClickType: onClickTypeProps,
    onHover,
  } = props;

  const onClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClickProps?.(e);
    },
    [onClickProps],
  );

  const onClickType = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClickProps?.(e);
      onClickTypeProps?.(e);
    },
    [onClickProps, onClickTypeProps],
  );

  const onMouseEnter = useCallback(() => {
    onHover?.(true);
  }, [onHover]);

  const onMouseLeave = useCallback(() => {
    onHover?.(false);
  }, [onHover]);

  return props.onClick || props.onHover ? (
    <>
      {props.propName && (
        <Link
          href={`#${props.propName}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          className={styles.propName}
        >
          {props.propName}
        </Link>
      )}
      {props.propName && <span>: </span>}
      {props.typeName && (
        <Link
          href={`#${props.typeName}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClickType}
          className={styles.tokenName}
        >
          {props.typeName}
        </Link>
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
