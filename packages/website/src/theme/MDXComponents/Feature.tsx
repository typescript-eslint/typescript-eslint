import React from 'react';

import styles from './Feature.module.css';

export interface FeatureProps {
  children: React.ReactNode;
  emoji: string;
}

export function Feature({ children, emoji }: FeatureProps): JSX.Element {
  return (
    <div className={styles.feature}>
      <div className={styles.emoji}>{emoji}</div>
      <p className={styles.children}>{children}</p>
    </div>
  );
}
