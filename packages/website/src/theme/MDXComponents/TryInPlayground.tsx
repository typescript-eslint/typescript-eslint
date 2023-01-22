import React from 'react';

import styles from './TryInPlayground.module.css';

export function TryInPlayground({
  eslintrcHash,
}: {
  eslintrcHash: string;
}): React.ReactNode {
  return (
    <div>
      <a
        href={`/play#eslintrc=${eslintrcHash}`}
        className={styles.tryInPlaygroundLink}
      >
        Try this rule in the playground ↗
      </a>
      <br />
    </div>
  );
}
