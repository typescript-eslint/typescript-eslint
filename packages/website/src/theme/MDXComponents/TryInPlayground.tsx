import Link from '@docusaurus/Link';
import clsx from 'clsx';
import React from 'react';

import styles from './TryInPlayground.module.css';

export function TryInPlayground({
  eslintrcHash,
  children,
  className,
  codeHash,
}: {
  eslintrcHash: string;
  children?: React.ReactNode;
  className?: string;
  codeHash?: string;
}): React.ReactNode {
  const params = new URLSearchParams({ eslintrc: eslintrcHash });
  if (codeHash) {
    params.set('code', codeHash);
  }

  return (
    <Link
      className={clsx(styles.tryInPlaygroundLink, className)}
      to={`/play#${params.toString()}`}
      target="_blank"
    >
      {children}
    </Link>
  );
}
