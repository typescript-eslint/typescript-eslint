import type * as ts from 'typescript';

import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';

import type { OnHoverNodeFn } from '../ast/types';

import styles from '../ast/ASTViewer.module.css';
import PropertyName from '../ast/PropertyName';
import { tsEnumToString } from '../ast/tsUtils';
import { getRange } from '../ast/utils';

export interface SimplifiedTreeViewProps {
  readonly onHoverNode?: OnHoverNodeFn;
  readonly onSelect: (value: ts.Node) => void;
  readonly selectedNode: ts.Node | undefined;
  readonly value: ts.Node;
}

function SimplifiedItem({
  onHoverNode,
  onSelect,
  selectedNode,
  value,
}: SimplifiedTreeViewProps): React.JSX.Element {
  const items = useMemo(() => {
    const result: ts.Node[] = [];
    value.forEachChild(child => {
      result.push(child);
    });
    return result;
  }, [value]);

  const onHover = useCallback(
    (v: boolean) => {
      if (onHoverNode) {
        return onHoverNode(v ? getRange(value, 'tsNode') : undefined);
      }
    },
    [onHoverNode, value],
  );

  return (
    <div className={styles.nonExpand}>
      <span className={selectedNode === value ? styles.selected : ''}>
        <PropertyName
          className={styles.propName}
          onClick={(): void => {
            onSelect(value);
          }}
          onHover={onHover}
          value={tsEnumToString('SyntaxKind', value.kind)}
        />
      </span>

      <div className={clsx(styles.subList, 'padding-left--md')}>
        {items.map((item, index) => (
          <SimplifiedItem
            key={index.toString()}
            onHoverNode={onHoverNode}
            onSelect={onSelect}
            selectedNode={selectedNode}
            value={item}
          />
        ))}
      </div>
    </div>
  );
}

export function SimplifiedTreeView(
  params: SimplifiedTreeViewProps,
): React.JSX.Element {
  return (
    <div className={clsx(styles.list, 'padding-left--sm')}>
      <SimplifiedItem {...params} />
    </div>
  );
}
