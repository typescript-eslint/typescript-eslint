import clsx from 'clsx';
import React from 'react';

import styles from './Tooltip.module.css';

export interface TooltipProps {
  readonly children: (React.JSX.Element | false)[] | React.JSX.Element;
  readonly text: string;
  readonly position?: 'left' | 'right';
  readonly open?: boolean;
  readonly hover?: boolean;
}

function Tooltip(props: TooltipProps): React.JSX.Element {
  return (
    <span
      aria-label={((props.open || props.hover) && props.text) || undefined}
      className={clsx(
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
