import { useLocation } from '@docusaurus/router';
import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import React from 'react';

import styles from './styles.module.css';

export default function NotFound(): React.JSX.Element {
  const location = useLocation();

  return (
    <>
      <PageMetadata title="Page Not Found" />
      <Layout>
        <main className="container margin-vert--xl">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h1 className={styles.title}>
                <strong>
                  {`'${location.pathname}'`.split('').map((letter, i) => (
                    <span className={styles.word} key={i}>
                      {letter}
                    </span>
                  ))}
                </strong>{' '}
                is not defined.
              </h1>
              <p className="hero__subtitle">
                Looks like the page you're looking for doesn't exist. 😥
              </p>
              <p>
                If you were linked here within typescript-eslint.io, there's
                probably a bug in the site. Please{' '}
                <a href="https://github.com/typescript-eslint/typescript-eslint/issues/new/choose">
                  file an issue on GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
