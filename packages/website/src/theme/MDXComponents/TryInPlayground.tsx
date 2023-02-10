import Link from '@docusaurus/Link';
import React from 'react';

import styles from './TryInPlayground.module.css';

export function TryInPlayground({
  eslintrcHash,
}: {
  eslintrcHash: string;
}): React.ReactNode {
  return (
    <Link
      className={styles.tryInPlaygroundLink}
      to={`/play#eslintrc=${eslintrcHash}`}
      target="_blank"
    >
      Try this rule in the playground ↗
    </Link>
  );
}
