import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';

import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { SelectedPosition, SelectedRange } from '../types';

import { ComplexItem } from './Elements';
import type Monaco from 'monaco-editor';
import { isRecord } from './utils';

export interface ASTViewerBaseProps {
  readonly ast: Record<string, unknown> | TSESTree.Node | string;
  readonly position?: Monaco.Position | null;
  readonly onSelectNode?: (node: SelectedRange | null) => void;
}

export interface ASTViewerProps extends ASTViewerBaseProps {
  readonly getTypeName: (data: unknown) => string | undefined;
  readonly formatValue?: (key: string, data: unknown) => string | undefined;
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

  return isRecord(props.ast) ? (
    <div className={styles.list}>
      <ComplexItem
        getTypeName={props.getTypeName}
        formatValue={props.formatValue}
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
