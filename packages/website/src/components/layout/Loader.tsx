import clsx from 'clsx';
import * as React from 'react';

import styles from './Loader.module.css';

function Loader(): JSX.Element {
  return (
    <span className={styles.loaderContainer}>
      <span className={clsx(styles.loader, styles.loader1)} />
      <span className={clsx(styles.loader, styles.loader2)} />
      <span className={clsx(styles.loader, styles.loader3)} />
    </span>
  );
}

export default Loader;
