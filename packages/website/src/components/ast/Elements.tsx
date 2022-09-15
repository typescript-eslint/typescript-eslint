import React, { useCallback, useEffect, useState } from 'react';

import type {
  GenericParams,
  ASTViewerModelMap,
  ASTViewerModelMapComplex,
  ASTViewerModelMapSimple,
} from './types';

import { hasChildInRange, isArrayInRange, isInRange } from './utils';

import styles from './ASTViewer.module.css';

import ItemGroup from './ItemGroup';
import HiddenItem from './HiddenItem';
import { SimpleItem } from './SimpleItem';

export function ComplexItem({
  data,
  onSelectNode,
  level,
  selection,
}: GenericParams<ASTViewerModelMapComplex>): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => level === 'ast');
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const onHover = useCallback(
    (state: boolean) => {
      if (onSelectNode) {
        const range = data.model.range;
        if (range) {
          onSelectNode(state ? range : null);
        }
      }
    },
    [data.model.range, onSelectNode],
  );

  useEffect(() => {
    const selected = selection
      ? data.model.type === 'array'
        ? isArrayInRange(selection, data.model)
        : isInRange(selection, data.model)
      : false;

    setIsSelected(
      level !== 'ast' && selected && !hasChildInRange(selection, data.model),
    );

    if (selected && !isExpanded) {
      setIsExpanded(selected);
    }
  }, [selection, data, level, isExpanded]);

  return (
    <ItemGroup
      data={data}
      isExpanded={isExpanded}
      isSelected={isSelected}
      canExpand={true}
      onHover={onHover}
      onClick={(): void => setIsExpanded(!isExpanded)}
    >
      <span>{data.model.type === 'array' ? '[' : '{'}</span>
      {isExpanded ? (
        <div className={styles.subList}>
          {data.model.value.map((item, index) => (
            <ElementItem
              level={`${level}_${item.key}[${index}]`}
              key={`${level}_${item.key}[${index}]`}
              selection={selection}
              data={item}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      ) : (
        <HiddenItem
          level={level}
          isArray={data.model.type === 'array'}
          value={data.model.value}
        />
      )}
      <span>{data.model.type === 'array' ? ']' : '}'}</span>
    </ItemGroup>
  );
}

export function ElementItem({
  level,
  selection,
  data,
  onSelectNode,
}: GenericParams<ASTViewerModelMap>): JSX.Element {
  if (data.model.type === 'array' || data.model.type === 'object') {
    return (
      <ComplexItem
        level={level}
        selection={selection}
        onSelectNode={onSelectNode}
        data={data as ASTViewerModelMapComplex}
      />
    );
  } else {
    return (
      <SimpleItem
        data={data as ASTViewerModelMapSimple}
        onSelectNode={onSelectNode}
      />
    );
  }
}
