import clsx from 'clsx';
import React from 'react';

import styles from './Tooltip.module.css';

export interface TooltipProps {
  readonly children: React.ReactNode;
  readonly text: string;
  readonly position?: 'left' | 'right';
  readonly open?: boolean;
  readonly hover?: boolean;
  readonly clasName?: string;
}

function Tooltip(props: TooltipProps): JSX.Element {
  return (
    <span
      aria-label={((props.open || props.hover) && props.text) || undefined}
      className={clsx(
        props.clasName,
        styles.tooltip,
        props.position === 'right' ? styles.tooltipRight : styles.tooltipLeft,
        props.open && styles.visible,
        props.hover && styles.hover,
      )}
    >
      {React.Children.map(props.children, child => child)}
    </span>
  );
}

export default Tooltip;
