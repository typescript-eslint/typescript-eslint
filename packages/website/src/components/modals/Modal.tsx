/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';
import CloseIcon from '../icons/CloseIcon';

interface ModalProps {
  readonly header: string;
  readonly children: JSX.Element | (JSX.Element | false)[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
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
        <div className={styles.modalBody}>
          {React.Children.map(props.children, child => child)}
        </div>
      </div>
    </div>
  );
}

export default Modal;
