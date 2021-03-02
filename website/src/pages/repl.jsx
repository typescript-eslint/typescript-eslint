import React, { lazy } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

const Editor = lazy(() => import('@site/src/components/editor'));

const value = `/* eslint @typescript-eslint/class-literal-property-style: ["error", "fields"] */

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
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <div className={styles.codeContainer}>
        <div className={styles.sourceCode}>
          <BrowserOnly>
            <Editor value={value} language="javascript" />
          </BrowserOnly>
        </div>
      </div>
    </Layout>
  );
}

export default Repl;
