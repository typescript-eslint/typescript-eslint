import React, { useState } from 'react';
import styles from './expander.module.css';
import { ArrowIcon } from './icons';

interface MyProps {
  children?: React.ReactNode;
  className?: string;
  label: string;
}

export default function Expander(props: MyProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.expander} ${props.className || ''}`}>
      <div className={styles.heading} onClick={handleToggle}>
        <ArrowIcon
          className={`${styles.arrow} ${
            isExpanded ? styles.expandedArrow : ''
          }`}
          pathClass={styles.path}
        />
        <div className={styles.headerLabel}>{props.label}</div>
      </div>
      {isExpanded && <div className={styles.children}>{props.children}</div>}
    </div>
  );
}
