import CopyIcon from '@theme/Icon/Copy';
import CheckIcon from '@theme/Icon/Success';
import clsx from 'clsx';
import React from 'react';

import { useClipboard } from '../../hooks/useClipboard';
import styles from './CopyButton.module.css';
import Tooltip from './Tooltip';

export interface CopyButtonProps {
  readonly className?: string;
  readonly value: unknown;
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

function CopyButton({ className, value }: CopyButtonProps): React.JSX.Element {
  const [on, onCopy] = useClipboard(() => jsonStringifyRecursive(value));

  return (
    <div className={styles.copyButtonContainer}>
      <Tooltip open={on} text="Copied">
        <button
          aria-label={!on ? 'Copy code to clipboard' : 'Copied'}
          className={clsx(styles.copyButton, className, 'button')}
          disabled={on}
          onClick={onCopy}
        >
          <CopyIcon className={styles.copyIcon} height="18" width="18" />
          <CheckIcon className={styles.checkIcon} height="18" width="18" />
        </button>
      </Tooltip>
    </div>
  );
}

export default CopyButton;
