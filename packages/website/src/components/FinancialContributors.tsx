import Link from '@docusaurus/Link';
import sponsors from '@site/data/sponsors.json';
import clsx from 'clsx';
import React from 'react';

import styles from './FinancialContributors.module.css';

interface Sponsor {
  description?: string;
  id: string;
  image: string;
  name: string;
  tier?: string;
  totalDonations: number;
  website?: string;
}

interface SponsorProps {
  sponsor: Sponsor;
  showName?: boolean;
}

function Sponsor({ showName, sponsor }: SponsorProps): JSX.Element {
  return (
    <a
      className={styles.sponsorLink}
      href={sponsor.website ?? undefined}
      title={sponsor.name}
      target="_blank"
      rel="noopener sponsored"
    >
      <img src={sponsor.image} alt={`${sponsor.name} logo`} />
      {showName && sponsor.name.split(' - ')[0]}
    </a>
  );
}

interface SponsorsProps {
  className: string;
  description: string;
  showName?: boolean;
  tier?: string;
  title: string;
}

function Sponsors(props: SponsorsProps): JSX.Element {
  return (
    <div className={clsx(styles.tierArea, props.className)}>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
      <ul className={clsx(styles[`tier-${props.tier}`], styles.sponsorsTier)}>
        {sponsors
          .filter(sponsor => sponsor.tier === props.tier)
          .map(sponsor => (
            <li key={sponsor.id}>
              <Sponsor showName={props.showName} sponsor={sponsor} />
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
          className={styles.tierSponsorArea}
          description="Donors of $750 and/or a monthly amount of $100 or more."
          showName
          tier="sponsor"
          title="Sponsors"
        />
        <Sponsors
          className={styles.tierSupporterArea}
          description="Donors of $150 and/or a monthly amount of $3 or more."
          tier="supporter"
          title="Supporters"
        />
        <Sponsors
          className={styles.tierOtherArea}
          description="Donors of $50 or more."
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
