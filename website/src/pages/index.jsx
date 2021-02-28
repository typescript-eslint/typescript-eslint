import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Easy to Use',
    imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
  },
  {
    title: 'Powered by React',
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Sponsors({ tier }) {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  const tierSponsors = siteConfig.customFields.sponsors.filter(
    sponsor => sponsor.tier === tier,
  );
  return (
    <div>
      <ul className={clsx(styles[`tier-${tier}`], styles.sponsorsTier)}>
        {tierSponsors.map((sponsor, i) => (
          <li key={i}>
            <a
              href={sponsor.website}
              title={sponsor.name}
              target="_blank"
              rel="noopener sponsored"
            >
              <img src={sponsor.image} alt={`Sponsored by ${sponsor.name}`} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={styles.heroBanner}>
        <div className="container">
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--primary', styles.heroButton)}
              to={useBaseUrl('getting-started/')}
            >
              Get Started
            </Link>
            <Link
              className={clsx('button button--info', styles.heroButton)}
              to={useBaseUrl('repl/')}
            >
              Playground
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
        <section className={styles.sponsors}>
          <div className="container">
            <h2>Financial Contributors</h2>
            <Sponsors title="Sponsors" tier="sponsor" />
            <Sponsors title="Supporter" tier="supporter" />
            <Link
              className="button button--info button--outline"
              to="https://opencollective.com/typescript-eslint/contribute"
              target="_blank"
            >
              Become a sponsor
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
