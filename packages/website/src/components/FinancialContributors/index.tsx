import Link from '@docusaurus/Link';
import sponsors from '@site/data/sponsors.json';
import clsx from 'clsx';
import React from 'react';

import { Sponsors } from './Sponsors';
import styles from './styles.module.css';

export function FinancialContributors(): JSX.Element {
  return (
    <>
      <p>
        The typescript-eslint project would not be possible without the generous
        support of our financial contributors.
      </p>
      <div className={styles.sponsorsContainer}>
        <Sponsors
          className={styles.tierSponsorArea}
          include={{ link: true, name: true }}
          tier="platinum-sponsor"
          title="Platinum Sponsors"
          sponsors={sponsors.slice(0, 6)}
        />
        <Sponsors
          className={styles.tierSupporterArea}
          include={{ link: true }}
          tier="gold-supporter"
          title="Gold Supporters"
          sponsors={sponsors.slice(6, 16)}
        />
        <Sponsors
          className={styles.tierOtherArea}
          tier="silver-supporter"
          title="Silver Supporters"
          sponsors={sponsors.slice(16, 34)}
        />
      </div>
      <div className={styles.linksArea}>
        <Link
          className={clsx('button button--primary', styles.become)}
          to="https://opencollective.com/typescript-eslint/contribute"
          target="_blank"
        >
          Become a financial sponsor
        </Link>
        <div className={styles.linksMore}>
          <Link
            className="button button--info button--outline"
            to="https://opencollective.com/typescript-eslint"
            target="_blank"
          >
            See all financial sponsors
          </Link>
          <Link
            className="button button--info button--outline"
            title="Sponsorship docs"
            to="https://github.com/typescript-eslint/typescript-eslint/blob/main/.github/SPONSORSHIPS.md"
            target="_blank"
          >
            Docs
          </Link>
        </div>
      </div>
    </>
  );
}
