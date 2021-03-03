import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

let Repl;
// https://reactjs.org/docs/error-decoder.html?invariant=294
if (!process.env.IS_SERVER) {
  const Editor = lazy(() => import('../components/editor'));

  Repl = function () {
    return (
      <Layout title="Playground" description="Playground" noFooter={true}>
        <div className={styles.codeContainer}>
          <div className={styles.options}>
            <label className={styles.settingsLabel} />
          </div>
          <div className={styles.sourceCode}>
            <Suspense fallback="loading">
              <Editor language="typescript" />
            </Suspense>
          </div>
        </div>
      </Layout>
    );
  };
} else {
  Repl = function () {
    return <div />;
  };
}

export default Repl;
