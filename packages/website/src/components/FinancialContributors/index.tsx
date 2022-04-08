import Link from '@docusaurus/Link';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';
import { Sponsors } from './Sponsors';

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
          include={{ link: true, name: true }}
          tier="sponsor"
          title="Sponsors"
        />
        <Sponsors
          className={styles.tierSupporterArea}
          description="Donors of $150 and/or a monthly amount of $10 or more."
          include={{ link: true }}
          tier="supporter"
          title="Supporters"
        />
        <Sponsors
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
