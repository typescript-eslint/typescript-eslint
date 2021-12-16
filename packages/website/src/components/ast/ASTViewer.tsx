import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';

import type { SelectedPosition, ASTViewerProps } from './types';

import { ElementItem } from './Elements';

function ASTViewer(props: ASTViewerProps): JSX.Element {
  const [selection, setSelection] = useState<SelectedPosition | null>(null);

  useEffect(() => {
    setSelection(
      props.position
        ? {
            line: props.position.lineNumber,
            column: props.position.column - 1,
          }
        : null,
    );
  }, [props.position]);

  return typeof props.value === 'string' ? (
    <div>{props.value}</div>
  ) : (
    <div className={styles.list}>
      <ElementItem
        getTooltip={props.getTooltip}
        value={props.value}
        level="ast"
        selection={selection}
        onSelectNode={props.onSelectNode}
      />
    </div>
  );
}

export default ASTViewer;
