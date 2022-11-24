import clsx from 'clsx';
import React from 'react';

import { Sponsor } from '../Sponsor';
import type { SponsorData, SponsorIncludeOptions } from '../types';
import styles from './styles.module.css';

interface SponsorsProps {
  className: string;
  include?: SponsorIncludeOptions;
  expanded?: boolean;
  sponsors: SponsorData[];
  title: string;
  tier: string;
}

export function Sponsors({
  className,
  include,
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
            <Sponsor include={include} sponsor={sponsor} />
          </li>
        ))}
      </ul>
    </div>
  );
}
