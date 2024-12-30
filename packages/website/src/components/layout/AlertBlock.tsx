import React from 'react';

export interface AlertBlockProps {
  readonly children: React.ReactNode;
  readonly type: 'danger' | 'info' | 'note' | 'success' | 'warning';
}

function AlertBlock(props: AlertBlockProps): React.JSX.Element {
  return (
    <div className={`admonition alert alert--${props.type}`}>
      <div className="admonition-content">{props.children}</div>
    </div>
  );
}

export default AlertBlock;
