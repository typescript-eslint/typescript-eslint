import React from 'react';

export interface AlertBlockProps {
  readonly type: 'danger' | 'info' | 'note' | 'success' | 'warning';
  readonly children: React.ReactNode;
}

function AlertBlock(props: AlertBlockProps): React.JSX.Element {
  return (
    <div className={`admonition alert alert--${props.type}`}>
      <div className="admonition-content">{props.children}</div>
    </div>
  );
}

export default AlertBlock;
