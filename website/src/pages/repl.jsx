import React from 'react';
import Layout from '@theme/Layout';
import Editor from '@site/src/components/editor';
import styles from './styles.module.css';

function Repl() {
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <div className={styles.codeContainer}>
        <div className={styles.sourceCode}>
          <Editor language="javascript" />
        </div>
      </div>
    </Layout>
  );
}

export default Repl;
