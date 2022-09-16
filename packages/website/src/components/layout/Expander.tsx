import { Collapsible, useCollapsible } from '@docusaurus/theme-common';
import ArrowIcon from '@site/src/icons/arrow.svg';
import clsx from 'clsx';
import React from 'react';

import styles from './Expander.module.css';

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
