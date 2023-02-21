import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import { FinancialContributors } from '../components/FinancialContributors';
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
            <h3 className="text--justify">
              <b>ESLint</b> is an awesome linter for JavaScript code.
            </h3>
            <p className="text--justify">
              ESLint statically analyzes your code to quickly find problems. It
              allows creating a series of assertions called lint rules around
              what your code should look or behave like, as well as auto-fixer
              suggestions to improve your code for you, and loading in lint
              rules from shared plugins.
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
            <h3 className="text--justify">
              <b>TypeScript</b> is a strongly typed programming language that
              builds on JavaScript.
            </h3>
            <p className="text--justify">
              TypeScript adds additional syntax to JavaScript that allows you to
              declare the shapes of objects and functions in code. It provides a
              set of language services that allow for running powerful
              inferences and automations with that type information.
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
            <strong>
              <code>typescript-eslint</code> enables ESLint to run on TypeScript
              code.
            </strong>{' '}
            It brings in the best of both tools to help you write the best
            JavaScript or TypeScript code you possibly can.
          </p>
        </div>
        <div className="col col--offset-2 col--8">
          <p>
            ESLint and TypeScript represent code differently internally.
            ESLint's default JavaScript parser cannot natively read in
            TypeScript-specific syntax and its rules don't natively have access
            to TypeScript's type information.
          </p>
        </div>
        <div className="col col--offset-2 col--8">
          <code>typescript-eslint</code>:
          <ul>
            <li>allows ESLint to parse TypeScript syntax</li>
            <li>
              creates a set of tools for ESLint rules to be able to use
              TypeScript's type information
            </li>
            <li>
              provides a large list of lint rules that are specific to
              TypeScript and/or use that type information
            </li>
          </ul>
        </div>
      </div>
    ),
  },
];

function Feature({ title, description }: FeatureItem): JSX.Element {
  return (
    <div className="col col--12 padding-vert--lg">
      <div className="text--center">
        <Heading
          as="h2"
          id={title.replace(/,/g, '').toLowerCase().replace(/\s|_/g, '-')}
        >
          {title}
        </Heading>
      </div>
      {description}
      <div className={styles.buttons}>
        <Link
          className={clsx('button button--primary', styles.buttonCentered)}
          to={useBaseUrl('getting-started')}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout description={`${siteConfig.tagline}`}>
      <header className={clsx('hero hero--dark', styles.hero)}>
        <div className="container">
          <img alt="" className={styles.hero__logo} src="/img/logo.svg" />
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
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
      </header>
      <main>
        {features.map((props, idx) => (
          <section
            key={idx}
            className={clsx(
              styles.features,
              idx % 2 === 1 ? styles.lightBackground : '',
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
            <Heading as="h2" id="financial-contributors">
              Financial Contributors
            </Heading>
            <FinancialContributors />
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
