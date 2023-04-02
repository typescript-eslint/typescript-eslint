import { useWindowSize } from '@docusaurus/theme-common';
import clsx from 'clsx';
import React from 'react';
import SplitPane, { type SplitPaneProps } from 'react-split-pane';

import splitPaneStyles from './SplitPane.module.css';

function ConditionalSplitPane({
  children,
  ...props
}: SplitPaneProps): JSX.Element {
  const windowSize = useWindowSize();

  return windowSize !== 'mobile' ? (
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
