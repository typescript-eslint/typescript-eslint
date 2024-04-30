import React from 'react';

import styles from './HiddenHeading.module.css';

export interface HiddenHeadingProps {
  id: string;
}

export function HiddenHeading({ id }: HiddenHeadingProps): React.JSX.Element {
  return <span className={styles.hiddenHeading} id={id} />;
}
