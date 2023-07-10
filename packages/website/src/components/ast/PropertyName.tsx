import Link from '@docusaurus/Link';
import type { KeyboardEvent, MouseEvent } from 'react';
import React, { useCallback } from 'react';

export interface PropertyNameProps {
  readonly value?: string;
  readonly onClick?: () => void;
  readonly onHover?: (e: boolean) => void;
  readonly className?: string;
}

export default function PropertyName({
  onClick: onClickProp,
  onHover: onHoverProp,
  className,
  value,
}: PropertyNameProps): JSX.Element {
  const onClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClickProp?.();
    },
    [onClickProp],
  );

  const onMouseEnter = useCallback(() => {
    onHoverProp?.(true);
  }, [onHoverProp]);

  const onMouseLeave = useCallback(() => {
    onHoverProp?.(false);
  }, [onHoverProp]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onClickProp?.();
      }
    },
    [onClickProp],
  );

  return (
    <Link
      className={className}
      href={`#${value}`}
      role="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={onClickProp && 0}
    >
      {value}
    </Link>
  );
}
