import CopyIcon from '@theme/Icon/Copy';
import CheckIcon from '@theme/Icon/Success';
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

function CopyButton({ value, className }: CopyButtonProps): React.JSX.Element {
  const [on, onCopy] = useClipboard(() => jsonStringifyRecursive(value));

  return (
    <div className={styles.copyButtonContainer}>
      <Tooltip open={on} text="Copied">
        <button
          onClick={onCopy}
          disabled={on}
          aria-label={!on ? 'Copy code to clipboard' : 'Copied'}
          className={clsx(styles.copyButton, className, 'button')}
        >
          <CopyIcon width="18" height="18" className={styles.copyIcon} />
          <CheckIcon width="18" height="18" className={styles.checkIcon} />
        </button>
      </Tooltip>
    </div>
  );
}

export default CopyButton;
