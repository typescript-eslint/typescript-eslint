import React, { useEffect } from 'react';
import styles from './Tooltip.module.css';
import clsx from 'clsx';

export interface TooltipProps {
  readonly children: JSX.Element | (JSX.Element | false)[];
  readonly text: string;
  readonly open?: boolean;
  readonly close: (status: boolean) => void;
}

function Tooltip(props: TooltipProps): JSX.Element {
  useEffect(() => {
    if (props.open) {
      setTimeout(() => {
        props.close(false);
      }, 1000);
    }
  }, [props.open]);

  return (
    <div className={clsx(styles.tooltip, props.open && styles.tooltipActive)}>
      {React.Children.map(props.children, child => child)}
      <span className={styles.tooltipText}>{props.text}</span>
    </div>
  );
}

export default Tooltip;
