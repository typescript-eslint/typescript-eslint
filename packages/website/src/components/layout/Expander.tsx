import React, { useState } from 'react';
import styles from './Expander.module.css';

import ArrowIcon from '../icons/ArrowIcon';

interface MyProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly label: string;
}

export default function Expander(props: MyProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.expander} ${props.className ?? ''}`}>
      <button className={styles.heading} onClick={handleToggle}>
        <ArrowIcon
          className={`${styles.arrow} ${
            isExpanded ? styles.expandedArrow : ''
          }`}
          pathClass={styles.path}
        />
        <span className={styles.headerLabel}>{props.label}</span>
      </button>
      {isExpanded && <div className={styles.children}>{props.children}</div>}
    </div>
  );
}
