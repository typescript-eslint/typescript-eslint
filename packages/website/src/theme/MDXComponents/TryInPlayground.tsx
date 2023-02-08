import React from 'react';

import styles from './TryInPlayground.module.css';

export function TryInPlayground({
  eslintrcHash,
}: {
  eslintrcHash: string;
}): React.ReactNode {
  return (
    <a
      className={styles.tryInPlaygroundLink}
      href={`/play#eslintrc=${eslintrcHash}`}
      target="_blank"
    >
      Try this rule in the playground ↗
    </a>
  );
}
