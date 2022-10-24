import React, { useEffect, useState } from 'react';

import styles from './ASTViewer.module.css';
import { ElementItem } from './Elements';
import type { ASTViewerProps, SelectedPosition } from './types';

function ASTViewer({
  position,
  value,
  onSelectNode,
}: ASTViewerProps): JSX.Element {
  const [selection, setSelection] = useState<SelectedPosition | null>(null);

  useEffect(() => {
    setSelection(
      position
        ? {
            line: position.lineNumber,
            column: position.column - 1,
          }
        : null,
    );
  }, [position]);

  return typeof value === 'string' ? (
    <div>{value}</div>
  ) : (
    <div className={styles.list}>
      <ElementItem
        data={value}
        level="ast"
        selection={selection}
        onSelectNode={onSelectNode}
      />
    </div>
  );
}

export default ASTViewer;
