import Link from '@docusaurus/Link';
import type { KeyboardEvent, MouseEvent } from 'react';
import React, { useCallback } from 'react';

export interface PropertyNameProps {
  readonly value?: string;
  readonly onClick?: () => void;
  readonly onHover?: (e: boolean) => void;
  readonly className?: string;
}

export default function PropertyName(props: PropertyNameProps): JSX.Element {
  const onClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      props.onClick?.();
    },
    [props.onClick],
  );

  const onMouseEnter = useCallback(() => {
    props.onHover?.(true);
  }, [props.onHover]);

  const onMouseLeave = useCallback(() => {
    props.onHover?.(false);
  }, [props.onHover]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.code === 'Space') {
        e.preventDefault();
        props.onClick?.();
      }
    },
    [props.onClick],
  );

  return (
    <Link
      className={props.className}
      href={`#${props.value}`}
      role="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={props.onClick && 0}
    >
      {props.value}
    </Link>
  );
}
