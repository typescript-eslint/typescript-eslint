import React, { lazy, Suspense } from 'react';
import styles from './playground.module.css';
import Expander from './expander';
import Loader from './loader';

const Editor = lazy(() => import('./editor'));

export default function Playground() {
  return (
    <div className={styles.codeContainer}>
      <div className={styles.options}>
        <Expander label="Parser Options" />
        <Expander label="ESLint Options" />
      </div>
      <div className={styles.sourceCode}>
        <Suspense fallback={<Loader />}>
          <Editor language="typescript" />
        </Suspense>
      </div>
    </div>
  );
}
