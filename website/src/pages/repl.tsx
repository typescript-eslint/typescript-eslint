import React, { lazy, Suspense, useState } from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

const Editor = lazy(() => import('../components/editor'));

function Repl() {
  // @ts-ignore https://reactjs.org/docs/error-decoder.html?invariant=294
  if (!process.browser) {
    return <div />;
  }
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <div className={styles.codeContainer}>
        <div className={styles.sourceCode}>
          <Suspense fallback="loading">
            <Editor language="typescript" />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}

export default Repl;
