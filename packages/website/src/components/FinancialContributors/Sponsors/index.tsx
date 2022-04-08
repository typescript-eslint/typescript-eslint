import sponsors from '@site/data/sponsors.json';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';
import { Sponsor } from '../Sponsor';
import { SponsorIncludeOptions } from '../types';

interface SponsorsProps {
  className: string;
  description: string;
  include?: SponsorIncludeOptions;
  expanded?: boolean;
  tier?: string;
  title: string;
}

export function Sponsors({
  className,
  description,
  include,
  tier,
  title,
}: SponsorsProps): JSX.Element {
  return (
    <div className={clsx(styles.tierArea, className)}>
      <h3>{title}</h3>
      <p>{description}</p>
      <ul className={clsx(styles.sponsorsTier, styles[`tier-${tier}`])}>
        {sponsors
          .filter(sponsor => sponsor.tier === tier)
          .map(sponsor => (
            <li key={sponsor.id}>
              <Sponsor include={include} sponsor={sponsor} />
            </li>
          ))}
      </ul>
    </div>
  );
}
