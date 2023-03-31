/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import CloseIcon from '@site/src/icons/close.svg';
import clsx from 'clsx';
import type { MouseEvent } from 'react';
import React, { useCallback, useEffect } from 'react';

import styles from './Modal.module.css';

interface ModalProps {
  readonly header: string;
  readonly children: JSX.Element | (JSX.Element | false)[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function Modal({ isOpen, onClose, children, header }: ModalProps): JSX.Element {
  useEffect(() => {
    const closeOnEscapeKeyDown = (e: KeyboardEvent): void => {
      if (
        e.key === 'Escape' ||
        // eslint-disable-next-line deprecation/deprecation -- intentional fallback for old browsers
        e.keyCode === 27
      ) {
        onClose();
      }
    };

    document.body.addEventListener('keydown', closeOnEscapeKeyDown);
    return (): void => {
      document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
    };
  }, [onClose]);

  const onClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.currentTarget === e.target) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <div
      className={clsx(styles.modal, isOpen ? styles.open : '')}
      onClick={onClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(styles.modalContent, 'item shadow--md')}
      >
        <div className={styles.modalHeader}>
          <h2>{header}</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className={clsx(styles.modalClose, 'clean-btn')}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
