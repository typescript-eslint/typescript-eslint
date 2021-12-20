import React, { useState } from 'react';
import styles from './Expander.module.css';

import ArrowIcon from '@site/src/icons/arrow.svg';

export interface ExpanderProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly label: string;
}

function Expander(props: ExpanderProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleToggle = (): void => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.expander} ${props.className ?? ''}`}>
      <button className={styles.heading} onClick={handleToggle}>
        <ArrowIcon
          className={`${styles.arrow} ${
            isExpanded ? styles.expandedArrow : ''
          }`}
        />
        <span className={styles.headerLabel}>{props.label}</span>
      </button>
      {isExpanded && <div className={styles.children}>{props.children}</div>}
    </div>
  );
}

export default Expander;
