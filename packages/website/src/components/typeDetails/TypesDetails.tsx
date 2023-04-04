import React, { useEffect, useState } from 'react';
import type * as ts from 'typescript';

import { findSelectionPath } from '../ast/selectedRange';
import type { OnHoverNodeFn } from '../ast/types';
import { isTSNode } from '../ast/utils';
import styles from '../Playground.module.css';
import ConditionalSplitPane from '../SplitPane/ConditionalSplitPane';
import { SimplifiedTreeView } from './SimplifiedTreeView';
import { TypeInfo } from './TypeInfo';

export interface TypesDetailsProps {
  readonly value: ts.Node;
  readonly typeChecker?: ts.TypeChecker;
  readonly cursorPosition?: number;
  readonly onHoverNode?: OnHoverNodeFn;
}

export function TypesDetails({
  cursorPosition,
  value,
  typeChecker,
  onHoverNode,
}: TypesDetailsProps): JSX.Element {
  const [selectedNode, setSelectedNode] = useState<ts.Node>(value);

  useEffect(() => {
    if (cursorPosition) {
      const item = findSelectionPath(value, cursorPosition);
      if (item.node && isTSNode(item.node)) {
        setSelectedNode(item.node);
      }
    }
  }, [cursorPosition, value]);

  return (
    <ConditionalSplitPane
      split="vertical"
      minSize="10%"
      defaultSize="50%"
      pane2Style={{ overflow: 'hidden' }}
    >
      <div>
        <div className={styles.playgroundInfoContainer}>
          <SimplifiedTreeView
            onHoverNode={onHoverNode}
            selectedNode={selectedNode}
            onSelect={setSelectedNode}
            value={value}
          />
        </div>
      </div>
      {selectedNode && (
        <div>
          <div className={styles.playgroundInfoContainer}>
            <TypeInfo
              onHoverNode={onHoverNode}
              typeChecker={typeChecker}
              value={selectedNode}
            />
          </div>
        </div>
      )}
    </ConditionalSplitPane>
  );
}
