import * as React from 'react';
import clsx from 'clsx';
import styles from './loader.module.css';

function Loader() {
  return (
    <span className={styles.loaderContainer}>
      <span className={clsx(styles.loader, styles.loader1)} />
      <span className={clsx(styles.loader, styles.loader2)} />
      <span className={clsx(styles.loader, styles.loader3)} />
    </span>
  );
}

export default Loader;
