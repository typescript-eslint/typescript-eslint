import Link from '@docusaurus/Link';
import React from 'react';

import type { SponsorData } from './types';

import styles from './styles.module.css';

interface SponsorProps {
  includeName?: boolean;
  sponsor: SponsorData;
}

export function Sponsor({
  includeName,
  sponsor,
}: SponsorProps): React.JSX.Element {
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
    <Link
      className={styles.sponsorLink}
      href={sponsor.website}
      title={sponsor.name}
      rel="noopener sponsored"
    >
      {children}
    </Link>
  );
}
