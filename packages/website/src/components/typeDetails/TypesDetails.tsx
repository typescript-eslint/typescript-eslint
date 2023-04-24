import React, { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type * as ts from 'typescript';

import { findSelectionPath } from '../ast/selectedRange';
import type { OnHoverNodeFn } from '../ast/types';
import { isTSNode } from '../ast/utils';
import styles from '../Playground.module.css';
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
    <PanelGroup
      className={styles.panelGroup}
      autoSaveId="playground-types"
      direction="horizontal"
    >
      <Panel id="simplifiedTree" defaultSize={35} collapsible={true}>
        <div className={styles.playgroundInfoContainer}>
          <SimplifiedTreeView
            onHoverNode={onHoverNode}
            selectedNode={selectedNode}
            onSelect={setSelectedNode}
            value={value}
          />
        </div>
      </Panel>
      <PanelResizeHandle className={styles.PanelResizeHandle} />
      {selectedNode && (
        <Panel id="typeInfo" collapsible={true}>
          <div className={styles.playgroundInfoContainer}>
            <TypeInfo
              onHoverNode={onHoverNode}
              onSelect={setSelectedNode}
              typeChecker={typeChecker}
              value={selectedNode}
            />
          </div>
        </Panel>
      )}
    </PanelGroup>
  );
}
