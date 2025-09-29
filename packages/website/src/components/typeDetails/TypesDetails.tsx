import type * as ts from 'typescript';

import React, { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import type { OnHoverNodeFn } from '../ast/types';

import { findSelectionPath } from '../ast/selectedRange';
import { isTSNode } from '../ast/utils';
import styles from '../Playground.module.css';
import { SimplifiedTreeView } from './SimplifiedTreeView';
import { TypeInfo } from './TypeInfo';

export interface TypesDetailsProps {
  readonly cursorPosition?: number;
  readonly onHoverNode?: OnHoverNodeFn;
  readonly typeChecker?: ts.TypeChecker;
  readonly value: ts.Node;
}

export function TypesDetails({
  cursorPosition,
  onHoverNode,
  typeChecker,
  value,
}: TypesDetailsProps): React.JSX.Element {
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
    <PanelGroup autoSaveId="playground-types" direction="horizontal">
      <Panel
        className={styles.PanelColumn}
        collapsible={true}
        defaultSize={35}
        id="simplifiedTree"
      >
        <div className={styles.playgroundInfoContainer}>
          <SimplifiedTreeView
            onHoverNode={onHoverNode}
            onSelect={setSelectedNode}
            selectedNode={selectedNode}
            value={value}
          />
        </div>
      </Panel>
      <PanelResizeHandle className={styles.PanelResizeHandle} />
      <Panel className={styles.PanelColumn} collapsible={true} id="typeInfo">
        <div className={styles.playgroundInfoContainer}>
          <TypeInfo
            onHoverNode={onHoverNode}
            typeChecker={typeChecker}
            value={selectedNode}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
}
