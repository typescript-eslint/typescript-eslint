import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import { Explainers } from '../components/home/Explainers';
import { FinancialContributors } from '../components/home/FinancialContributors';
import { RecentBlogPosts } from '../components/home/RecentBlogPosts';
import styles from './styles.module.css';

function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout description={siteConfig.tagline}>
      <main>
        <div className={clsx('hero hero--dark', styles.hero)}>
          <div className={clsx('container', styles.heroContainer)}>
            <div className={styles.heroLeft}>
              <h1 className="hero__title">{siteConfig.title}</h1>
              <p className="hero__subtitle">
                {siteConfig.tagline.replace(' code', '')}
              </p>
              <div className={styles.buttons}>
                <Link
                  className="button button--primary"
                  to={useBaseUrl('getting-started')}
                >
                  Get Started
                </Link>
                <Link
                  className="button button--secondary button--outline"
                  to={useBaseUrl('play/')}
                >
                  Playground
                </Link>
              </div>
            </div>
            <div className={styles.heroRight}>
              <img
                alt="Hero Logo"
                className={styles.heroLogo}
                src="/img/logo.svg"
              />
            </div>
          </div>
        </div>

        <Explainers />
        <RecentBlogPosts />
        <FinancialContributors />
      </main>
    </Layout>
  );
}

export default Home;
