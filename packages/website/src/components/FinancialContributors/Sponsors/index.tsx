import clsx from 'clsx';
import React from 'react';

import { Sponsor } from '../Sponsor';
import type { SponsorData } from '../types';
import styles from './styles.module.css';

interface SponsorsProps {
  className: string;
  includeName?: boolean;
  expanded?: boolean;
  sponsors: SponsorData[];
  title: string;
  tier: string;
}

export function Sponsors({
  className,
  includeName,
  title,
  tier,
  sponsors,
}: SponsorsProps): JSX.Element {
  return (
    <div className={clsx(styles.tierArea, className)}>
      <h3>{title}</h3>
      <ul className={clsx(styles.sponsorsTier, styles[`tier-${tier}`])}>
        {sponsors.map(sponsor => (
          <li key={sponsor.id}>
            <Sponsor includeName={includeName} sponsor={sponsor} />
          </li>
        ))}
      </ul>
    </div>
  );
}
