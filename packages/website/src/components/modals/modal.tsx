import React from 'react';
import clsx from 'clsx';
import styles from './modal.module.css';
import { CloseIcon } from '../icons';

interface ModalProps {
  header: string;
  children: JSX.Element;
  isOpen: boolean;
  onClose: () => void;
}

function Modal(props: ModalProps): JSX.Element {
  return (
    <div
      className={clsx(styles.modal, props.isOpen ? styles.open : '')}
      onClick={props.onClose}
    >
      <div
        className={clsx(styles.modalContent, 'item shadow--md')}
        onClick={(e): void => {
          e.stopPropagation();
        }}
      >
        <div className={styles.modalHeader}>
          <h2>{props.header}</h2>
          <CloseIcon
            className={styles.modalClose}
            onClick={props.onClose}
            size={22}
          />
        </div>
        <div className={styles.modalBody}>{props.children}</div>
      </div>
    </div>
  );
}

export default Modal;
