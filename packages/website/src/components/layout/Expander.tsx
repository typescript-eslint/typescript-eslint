import React from 'react';
import clsx from 'clsx';
import { useCollapsible, Collapsible } from '@docusaurus/theme-common';
import styles from './Expander.module.css';

import ArrowIcon from '@site/src/icons/arrow.svg';

export interface ExpanderProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly label: string;
}

function Expander(props: ExpanderProps): JSX.Element {
  const { collapsed, toggleCollapsed } = useCollapsible({
    initialState: false,
  });

  return (
    <div className={clsx(styles.expander, props.className)}>
      <button className={styles.heading} onClick={toggleCollapsed}>
        <ArrowIcon
          className={clsx(styles.arrow, !collapsed && styles.expandedArrow)}
        />
        <span className={styles.headerLabel}>{props.label}</span>
      </button>
      <Collapsible lazy={false} as="div" collapsed={collapsed}>
        <div className={styles.children}>{props.children}</div>
      </Collapsible>
    </div>
  );
}

export default Expander;
