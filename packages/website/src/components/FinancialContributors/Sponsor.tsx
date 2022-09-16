import React from 'react';

import type { SponsorData, SponsorIncludeOptions } from './types';
import styles from './styles.module.css';

interface SponsorProps {
  include?: SponsorIncludeOptions;
  sponsor: SponsorData;
}

export function Sponsor({ include = {}, sponsor }: SponsorProps): JSX.Element {
  let children = <img alt={`${sponsor.name} logo`} src={sponsor.image} />;

  if (include.name) {
    children = (
      <>
        {children}
        {sponsor.name.split(' - ')[0]}
      </>
    );
  }

  if (include.link) {
    children = (
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

  return children;
}
