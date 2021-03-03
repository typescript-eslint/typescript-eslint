import React, { useState } from 'react';
import styles from './expander.module.css';

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${styles.arrow} ${
            isExpanded ? styles.expandedArrow : ''
          }`}
          viewBox="0 0 24 24"
        >
          <path
            className={styles.path}
            d="
              M17.664 10.49a.708.708 0 00-.518-.22H6.833c-.2
              0-.372.074-.518.22a.708.708 0 00-.218.518c0
              .2.073.372.218.518l5.157 5.156a.708.708 0
              00.518.218c.199 0 .372-.073.517-.218l5.157-5.157a.708.708
              0 00.218-.517c0-.2-.073-.372-.218-.518z
            "
          />
        </svg>
        <div className={styles.label}>{props.label}</div>
      </div>
      {isExpanded && <div className={styles.children}>{props.children}</div>}
    </div>
  );
}
