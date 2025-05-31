import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';

import CopyButton from '@theme/CodeBlock/Buttons/CopyButton';
import WordWrapButton from '@theme/CodeBlock/Buttons/WordWrapButton';
import TryInPlaygroundButton from '@theme/CodeBlock/Buttons/TryInPlaygroundButton';
import type { Props } from '@theme/CodeBlock/Buttons';

import styles from './styles.module.css';

// Code block buttons are not server-rendered on purpose
// Adding them to the initial HTML is useless and expensive (due to JSX SVG)
// They are hidden by default and require React  to become interactive
export default function CodeBlockButtons({ className }: Props): ReactNode {
  return (
    <BrowserOnly>
      {() => (
        <div className={clsx(className, styles.buttonGroup)}>
          <TryInPlaygroundButton />
          <WordWrapButton />
          <CopyButton />
        </div>
      )}
    </BrowserOnly>
  );
}
