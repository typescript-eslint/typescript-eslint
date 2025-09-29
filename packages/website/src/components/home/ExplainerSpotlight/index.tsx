import Heading from '@theme/Heading';
import React from 'react';

import styles from './styles.module.css';

export interface ExplainerSpotlightProps extends React.PropsWithChildren {
  header: string;
  emoji: string;
  href: string;
}

export function ExplainerSpotlight({
  children,
  emoji,
  header,
  href,
}: ExplainerSpotlightProps): React.JSX.Element {
  return (
    <a className={styles.explainerSpotlight} href={href}>
      <Heading as="h3" className={styles.heading}>
        {header} <span className={styles.emoji}>{emoji}</span>
      </Heading>
      <div>{children}</div>
    </a>
  );
}
