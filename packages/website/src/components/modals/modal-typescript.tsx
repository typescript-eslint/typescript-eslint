import Modal from './modal';
import React from 'react';

interface ModalTypeScriptProps {
  isOpen: boolean;
  onClose: () => void;
}

function ModalTypeScript(props: ModalTypeScriptProps): JSX.Element {
  return (
    <Modal
      header="TypeScript Config WIP"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <>WIP</>
    </Modal>
  );
}

export default ModalTypeScript;
