import React from 'react';
import Layout from '@theme/Layout';
import Editor from '@site/src/components/editor';
import styles from './styles.module.css';

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
          <Editor value={value} language="javascript" />
        </div>
      </div>
    </Layout>
  );
}

export default Repl;
