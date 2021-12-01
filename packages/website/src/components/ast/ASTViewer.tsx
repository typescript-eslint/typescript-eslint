import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';

import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { SelectedPosition, SelectedRange } from '../types';

import { ElementObject } from './Elements';
import type Monaco from 'monaco-editor';
import { isRecord } from './selection';

export interface ASTViewerProps {
  ast: Record<string, unknown> | TSESTree.Node | string;
  position?: Monaco.Position | null;
  onSelectNode: (node: SelectedRange | null) => void;
}

function ASTViewer(props: ASTViewerProps): JSX.Element {
  const [selection, setSelection] = useState<SelectedPosition | null>(() =>
    props.position
      ? {
          line: props.position.lineNumber,
          column: props.position.column - 1,
        }
      : null,
  );

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

  return isRecord(props.ast) ? (
    <div className={styles.list}>
      <ElementObject
        value={props.ast}
        level="ast"
        selection={selection}
        onSelectNode={props.onSelectNode}
      />
    </div>
  ) : (
    <div>{props.ast}</div>
  );
}

export default ASTViewer;
