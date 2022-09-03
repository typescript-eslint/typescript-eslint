/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React, { MouseEvent, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';
import CloseIcon from '@site/src/icons/close.svg';

interface ModalProps {
  readonly header: string;
  readonly children: JSX.Element | (JSX.Element | false)[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function Modal(props: ModalProps): JSX.Element {
  useEffect(() => {
    const closeOnEscapeKeyDown = (e: KeyboardEvent): void => {
      if (
        e.key === 'Escape' ||
        // eslint-disable-next-line deprecation/deprecation -- intentional fallback for old browsers
        e.keyCode === 27
      ) {
        props.onClose();
      }
    };

    document.body.addEventListener('keydown', closeOnEscapeKeyDown);
    return (): void => {
      document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
    };
  }, []);

  const onClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.currentTarget === e.target) {
        props.onClose();
      }
    },
    [props.onClose],
  );

  return (
    <div
      className={clsx(styles.modal, props.isOpen ? styles.open : '')}
      onClick={onClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(styles.modalContent, 'item shadow--md')}
      >
        <div className={styles.modalHeader}>
          <h2>{props.header}</h2>
          <button
            aria-label="Close"
            onClick={props.onClose}
            className={clsx(styles.modalClose, 'clean-btn')}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalBody}>
          {React.Children.map(props.children, child => child)}
        </div>
      </div>
    </div>
  );
}

export default Modal;
