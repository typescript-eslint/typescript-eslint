import clsx from 'clsx';
import React from 'react';

import styles from './Feature.module.css';

export interface FeatureProps {
  children: React.ReactNode;
  emoji: string;
  fullWidth?: boolean;
}

export function Feature({
  children,
  emoji,
  fullWidth,
}: FeatureProps): JSX.Element {
  return (
    <div className={clsx(styles.feature, fullWidth && styles.featureFullWidth)}>
      <div className={styles.emoji}>{emoji}</div>
      <p className={styles.children}>{children}</p>
    </div>
  );
}
