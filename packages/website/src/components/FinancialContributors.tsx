import Link from '@docusaurus/Link';
import sponsors from '@site/data/sponsors.json';
import clsx from 'clsx';
import React from 'react';

import styles from './FinancialContributors.module.css';

function Sponsors(props: {
  description: string;
  showName?: boolean;
  tier: string;
  title: string;
}): JSX.Element {
  const tierSponsors = sponsors.filter(sponsor => sponsor.tier === props.tier);
  return (
    <div className={styles.tierArea}>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
      <ul className={clsx(styles[`tier-${props.tier}`], styles.sponsorsTier)}>
        {tierSponsors.map(sponsor => (
          <li key={sponsor.id}>
            <a
              className={styles.sponsorLink}
              href={sponsor.website ?? undefined}
              title={sponsor.name}
              target="_blank"
              rel="noopener sponsored"
            >
              <img src={sponsor.image} alt={`${sponsor.name} logo`} />
              {props.showName && sponsor.name}
            </a>
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
          description="Contributors of a monthly amount of $100 or more."
          showName
          tier="sponsor"
          title="Sponsors"
        />
        <Sponsors
          description="Contributors of a monthly amount of $3 or more."
          tier="supporter"
          title="Supporters"
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
