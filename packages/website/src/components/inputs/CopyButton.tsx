import CheckIcon from '@site/src/icons/check.svg';
import CopyIcon from '@site/src/icons/copy.svg';
import clsx from 'clsx';
import React from 'react';

import { useClipboard } from '../../hooks/useClipboard';
import styles from './CopyButton.module.css';
import Tooltip from './Tooltip';

export interface CopyButtonProps {
  readonly value: unknown;
  readonly className?: string;
}

function jsonStringifyRecursive(obj: unknown): string {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value: unknown) => {
      if (typeof value === 'object' && value != null) {
        if (cache.has(value)) {
          return;
        }
        cache.add(value);
      }
      return value;
    },
    2,
  );
}

function CopyButton({ value, className }: CopyButtonProps): JSX.Element {
  const [on, onCopy] = useClipboard(() => jsonStringifyRecursive(value));

  return (
    <button
      onClick={onCopy}
      disabled={on}
      aria-label={!on ? 'Copy code to clipboard' : 'Copied'}
      className={clsx(styles.copyButton, className, 'button')}
    >
      <Tooltip open={on} text="Copied" clasName={styles.copyButtonTooltip}>
        <CopyIcon className={styles.copyIcon} />
        <CheckIcon className={styles.checkIcon} />
      </Tooltip>
    </button>
  );
}

export default CopyButton;
