import Link from '@docusaurus/Link';
import sponsors from '@site/data/sponsors.json';
import clsx from 'clsx';
import React from 'react';

import { Sponsors } from './Sponsors';
import styles from './styles.module.css';

export function FinancialContributors(): React.JSX.Element {
  return (
    <>
      <p>
        The typescript-eslint project would not be possible without the generous
        support of our financial contributors.
      </p>
      <div className={styles.sponsorsContainer}>
        <Sponsors
          className={styles.tierSponsorArea}
          includeName
          sponsors={sponsors.slice(0, 6)}
          tier="platinum-sponsor"
          title="Platinum Sponsors"
        />
        <Sponsors
          className={styles.tierSupporterArea}
          sponsors={sponsors.slice(6, 16)}
          tier="gold-supporter"
          title="Gold Supporters"
        />
        <Sponsors
          className={styles.tierOtherArea}
          sponsors={sponsors.slice(16, 34)}
          tier="silver-supporter"
          title="Silver Supporters"
        />
      </div>
      <div className={styles.linksArea}>
        <Link
          className={clsx('button button--primary', styles.become)}
          target="_blank"
          to="https://opencollective.com/typescript-eslint/contribute"
        >
          Become a financial sponsor
        </Link>
        <div className={styles.linksMore}>
          <Link
            className="button button--info button--outline"
            target="_blank"
            to="https://opencollective.com/typescript-eslint"
          >
            See all financial sponsors
          </Link>
          <Link
            className="button button--info button--outline"
            target="_blank"
            title="Sponsorship docs"
            to="https://github.com/typescript-eslint/typescript-eslint/blob/main/.github/SPONSORSHIPS.md"
          >
            Docs
          </Link>
        </div>
      </div>
    </>
  );
}
