import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

interface FeatureItem {
  title: string;
  description: JSX.Element;
  imageUrl?: string;
}

const features: FeatureItem[] = [
  {
    title: 'What are ESLint and TypeScript, and how do they compare?',
    description: (
      <>
        <div className="row padding-vert--lg">
          <div className="col col--2 text--center">
            <img
              src="/img/eslint.svg"
              alt="eslint"
              className={styles.featureImage}
            />
          </div>
          <div className="col col--8">
            <h4 className="text--justify">
              <b>ESLint</b> is an awesome linter for JavaScript code.
            </h4>
            <p className="text--justify">
              Behind the scenes, it uses a parser to turn your source code into
              a data format called an Abstract Syntax Tree (AST). This data
              format is then used by plugins to create assertions called lint
              rules around what your code should look or behave like.
            </p>
          </div>
        </div>
        <div className="row padding-vert--lg">
          <div className="col col--2 text--center">
            <img
              src="/img/typescript.svg"
              alt="TypeScript"
              className={styles.featureImage}
            />
          </div>
          <div className="col col--8">
            <h4 className="text--justify">
              <b>TypeScript</b> is an awesome static code analyzer for
              JavaScript code, and some additional syntax that it provides on
              top of the underlying JavaScript language.
            </h4>
            <p className="text--justify">
              Behind the scenes, it uses a parser to turn your source code into
              a data format called an Abstract Syntax Tree (AST). This data
              format is then used by other parts of the TypeScript Compiler to
              do things like give you feedback on issues, allow you to refactor
              easily, etc.
            </p>
          </div>
        </div>
        <div className="row padding-vert--sm">
          <div className="col col--offset-2 col--8">
            <p className="text--center">
              They sound similar, right? They are! Both projects are ultimately
              striving to help you write the best JavaScript code you possibly
              can.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Why does this project exist?',
    description: (
      <div className="row padding-vert--lg text--justify">
        <div className="col col--offset-2 col--8">
          <p>
            As covered by the previous section, both ESLint and TypeScript rely
            on turning your source code into a data format called an AST in
            order to do their jobs.
          </p>
        </div>
        <div className="col col--offset-2 col--8">
          <p>
            However, it turns out that ESLint and TypeScript use different ASTs
            to each other.
          </p>
        </div>
        <div className="col col--offset-2 col--8">
          <p>
            The reason for this difference is not so interesting or important
            and is simply the result of different evolutions, priorities, and
            timelines of the projects.
          </p>
        </div>
        <div className="col col--offset-2 col--8">
          <p>
            This project, <code>typescript-eslint</code>, exists primarily
            because of this major difference between the projects.
          </p>
        </div>
        <div className="col col--offset-2 col--8">
          <p>
            <code>typescript-eslint</code> exists so that you can use ESLint and
            TypeScript together, without needing to worry about implementation
            detail differences wherever possible.
          </p>
        </div>
      </div>
    ),
  },
];

function Feature({ imageUrl, title, description }: FeatureItem): JSX.Element {
  const imgUrl = imageUrl ? useBaseUrl(imageUrl) : undefined;
  return (
    <div className="col col--12 padding-vert--lg">
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h2 className="text--center">{title}</h2>
      {description}
    </div>
  );
}

function Sponsors(props: {
  tier: string;
  title: string;
  className?: string;
}): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  const tierSponsors = siteConfig.customFields.sponsors.filter(
    sponsor => sponsor.tier === props.tier,
  );
  return (
    <div className={props.className}>
      <ul className={clsx(styles[`tier-${props.tier}`], styles.sponsorsTier)}>
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

function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description={`${siteConfig.tagline}`}>
      <header className={clsx('hero hero--dark', styles.hero)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--primary" to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features &&
          features.length > 0 &&
          features.map((props, idx) => (
            <section
              key={idx}
              className={clsx(
                styles.features,
                idx % 2 == 1 ? styles.lightBackground : '',
              )}
            >
              <div className="container">
                <div className="row">
                  <Feature {...props} />
                </div>
              </div>
            </section>
          ))}
        <section className={styles.sponsors}>
          <div className="container text--center padding-vert--lg">
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
