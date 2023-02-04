import React from 'react';

import styles from './styles.module.css';
import type { SponsorData } from './types';

interface SponsorProps {
  includeName?: boolean;
  sponsor: SponsorData;
}

export function Sponsor({ includeName, sponsor }: SponsorProps): JSX.Element {
  let children = <img alt={`${sponsor.name} logo`} src={sponsor.image} />;

  if (includeName) {
    children = (
      <>
        {children}
        {sponsor.name.split(' - ')[0]}
      </>
    );
  }

  return (
    <a
      className={styles.sponsorLink}
      href={sponsor.website ?? undefined}
      title={sponsor.name}
      target="_blank"
      rel="noopener sponsored"
    >
      {children}
    </a>
  );
}
