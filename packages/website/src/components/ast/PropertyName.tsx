import type { KeyboardEvent, MouseEvent } from 'react';

import Link from '@docusaurus/Link';
import React, { useCallback } from 'react';

export interface PropertyNameProps {
  readonly className?: string;
  readonly onClick?: () => void;
  readonly onHover?: (e: boolean) => void;
  readonly value?: string;
}

export default function PropertyName({
  className,
  onClick: onClickProp,
  onHover: onHoverProp,
  value,
}: PropertyNameProps): React.JSX.Element {
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
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={onClickProp && 0}
    >
      {value}
    </Link>
  );
}
