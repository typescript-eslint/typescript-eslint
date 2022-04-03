import Link from '@docusaurus/Link';
import sponsors from '@site/data/sponsors.json';
import clsx from 'clsx';
import React from 'react';

import styles from './FinancialContributors.module.css';
import { Sponsor } from './types';
import { SponsorBasic } from './SponsorBasic';
import { SponsorExpanded } from './SponsorExpanded';

interface SponsorProps {
  className?: string;
  sponsor: Sponsor;
}

interface SponsorsProps {
  as: React.ComponentType<SponsorProps>;
  className: string;
  description: string;
  expanded?: boolean;
  tier?: string;
  title: string;
}

function Sponsors({ as: As, ...props }: SponsorsProps): JSX.Element {
  return (
    <div className={clsx(styles.tierArea, props.className)}>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
      <ul className={clsx(styles[`tier-${props.tier}`], styles.sponsorsTier)}>
        {sponsors
          .filter(sponsor => sponsor.tier === props.tier)
          .map(sponsor => (
            <li key={sponsor.id}>
              <As sponsor={sponsor} />
            </li>
          ))}
      </ul>
    </div>
  );
}

export function FinancialContributors(): JSX.Element {
  return (
    <>
      <p>
        The TypeScript ESLint project would not be possible without the generous
        support of our financial contributors.
      </p>
      <div className={styles.sponsorsContainer}>
        <Sponsors
          as={SponsorExpanded}
          className={styles.tierSponsorArea}
          description="Donors of $750 and/or a monthly amount of $100 or more."
          tier="sponsor"
          title="Sponsors"
        />
        <Sponsors
          as={SponsorBasic}
          className={styles.tierSupporterArea}
          description="Donors of $150 and/or a monthly amount of $10 or more."
          tier="supporter"
          title="Supporters"
        />
        <Sponsors
          as={SponsorBasic}
          className={styles.tierOtherArea}
          description="Donors of $50 and/or a monthly amount of $3 or more."
          tier="contributor"
          title="Contributors"
        />
      </div>
      <Link
        className={clsx('button button--info button--outline', styles.become)}
        to="https://opencollective.com/typescript-eslint/contribute"
        target="_blank"
      >
        Become a financial contributor
      </Link>
    </>
  );
}
