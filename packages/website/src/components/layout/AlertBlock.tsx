import React from 'react';

export interface AlertBlockProps {
  readonly type: 'success' | 'info' | 'note' | 'warning' | 'danger';
  readonly children: React.ReactNode;
}

function AlertBlock(props: AlertBlockProps): JSX.Element {
  return (
    <div className={`admonition alert alert--${props.type}`}>
      <div className="admonition-content">{props.children}</div>
    </div>
  );
}

export default AlertBlock;
