import CodeBlock from '@theme/CodeBlock';
import { configs } from '@typescript-eslint/website-eslint';
import React from 'react';

import styles from './ConfigurationContents.module.css';

export interface ConfigurationContentsProps {
  name: string;
}

export function ConfigurationContents({
  name,
}: ConfigurationContentsProps): JSX.Element {
  return (
    <details className={styles.configurationContents}>
      <summary className={styles.summary}>
        Contents of the <code>{name}</code> config
      </summary>
      <CodeBlock language="json">{configs[name]}</CodeBlock>
    </details>
  );
}
