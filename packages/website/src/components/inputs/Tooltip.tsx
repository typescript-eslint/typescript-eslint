import clsx from 'clsx';
import React from 'react';

import styles from './Tooltip.module.css';

export interface TooltipProps {
  readonly children: (false | React.JSX.Element)[] | React.JSX.Element;
  readonly hover?: boolean;
  readonly open?: boolean;
  readonly position?: 'left' | 'right';
  readonly text: string;
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
