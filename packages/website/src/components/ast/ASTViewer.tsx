import React, { useEffect, useState } from 'react';
import styles from './ASTViewer.module.css';

import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { Position } from './types';

import { ElementObject } from './Elements';
import type Monaco from 'monaco-editor';

function ASTViewer(props: {
  ast: TSESTree.Node | string;
  position?: Monaco.Position | null;
  onSelectNode: (node: TSESTree.Node | null) => void;
}): JSX.Element {
  const [selection, setSelection] = useState<Position | null>(() =>
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

  return typeof props.ast === 'string' ? (
    <div>{props.ast}</div>
  ) : (
    <div className={styles.list}>
      <ElementObject
        value={props.ast}
        level="ast"
        selection={selection}
        onSelectNode={props.onSelectNode}
      />
    </div>
  );
}

export default ASTViewer;
