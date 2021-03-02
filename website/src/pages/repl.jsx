import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

const Editor = lazy(() => import('@site/src/components/editor'));

const value = `/* eslint @typescript-eslint/class-literal-property-style: ["error", "fields"] */
/* eslint @typescript-eslint/adjacent-overload-signatures: ["error"] */

class Mx {
  public static get myField1() {
    return 1;
  }

  private get ['myField2']() {
    return 'hello world';
  }
}
`;

function Repl() {
  /**
   * https://reactjs.org/docs/error-decoder.html?invariant=294
   */
  if (!process.browser) {
    return <div />;
  }
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <div className={styles.codeContainer}>
        <div className={styles.sourceCode}>
          <Suspense fallback="loading">
            <Editor value={value} language="typescript" />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}

export default Repl;
