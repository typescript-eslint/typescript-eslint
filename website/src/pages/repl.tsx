import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';

const Editor = lazy(() => import('../components/editor'));

const value = `/* eslint @typescript-eslint/class-literal-property-style: ["error", "fields"] */
/* eslint @typescript-eslint/adjacent-overload-signatures: ["error"] */
/* eslint @typescript-eslint/array-type: ["error", { default: "generic" }] */

class Mx {
  public static get myField1() {
    return 1;
  }

  private get ['myField2']() {
    return 'hello world';
  }
}

const x: string[] = ['a', 'b'];
const y: readonly string[] = ['a', 'b'];
`;

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
            <Editor value={value} language="typescript" />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}

export default Repl;
