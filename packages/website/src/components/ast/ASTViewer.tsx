import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';

import type {
  ASTViewerBaseProps,
  SelectedPosition,
  GetNodeNameFn,
  GetTooltipFn,
} from './types';

import { ComplexItem } from './Elements';
import { isRecord } from './utils';

export interface ASTViewerProps extends ASTViewerBaseProps {
  readonly getNodeName: GetNodeNameFn;
  readonly getTooltip?: GetTooltipFn;
}

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
