import React, { useCallback } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps } from './ast/types';

export default function ASTViewerScope(props: ASTViewerBaseProps): JSX.Element {
  const filterProps = useCallback(
    (item: [string, unknown]): boolean =>
      !item[0].startsWith('_') && item[1] !== undefined,
    [],
  );

  return (
    <ASTViewer
      filterProps={filterProps}
      getRange={(): undefined => undefined}
      getTooltip={(): undefined => undefined}
      getNodeName={(): undefined => undefined}
      {...props}
    />
  );
}
