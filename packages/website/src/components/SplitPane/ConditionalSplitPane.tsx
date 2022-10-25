import clsx from 'clsx';
import React from 'react';
import SplitPane, { type SplitPaneProps } from 'react-split-pane';

import splitPaneStyles from './SplitPane.module.css';

export interface ConditionalSplitPaneProps {
  render: boolean;
}

function ConditionalSplitPane({
  render,
  children,
  ...props
}: ConditionalSplitPaneProps & SplitPaneProps): JSX.Element {
  return render ? (
    <SplitPane
      resizerClassName={clsx(splitPaneStyles.resizer, splitPaneStyles.vertical)}
      {...props}
    >
      {children}
    </SplitPane>
  ) : (
    <>{children}</>
  );
}

export default ConditionalSplitPane;
