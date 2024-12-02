import clsx from 'clsx';
import React from 'react';

import type { SponsorData } from '../types';

import { Sponsor } from '../Sponsor';
import styles from './styles.module.css';

interface SponsorsProps {
  className: string;
  expanded?: boolean;
  includeName?: boolean;
  sponsors: SponsorData[];
  tier: string;
  title: string;
}

export function Sponsors({
  className,
  includeName,
  sponsors,
  tier,
  title,
}: SponsorsProps): React.JSX.Element {
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
