import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';

import type { SelectedPosition, ASTViewerProps } from './types';

import { ComplexItem } from './Elements';
import { isRecord } from './utils';

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

  return isRecord(props.value) ? (
    <div className={styles.list}>
      <ComplexItem
        getNodeName={props.getNodeName}
        getTooltip={props.getTooltip}
        getRange={props.getRange}
        filterProps={props.filterProps}
        value={props.value}
        level="ast"
        selection={selection}
        onSelectNode={props.onSelectNode}
      />
    </div>
  ) : (
    <div>{props.value}</div>
  );
}

export default ASTViewer;
