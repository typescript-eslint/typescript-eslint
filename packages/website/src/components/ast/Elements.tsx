import React, { useCallback, useEffect, useState } from 'react';

import type {
  GenericParams,
  ASTViewerModelComplex,
  ASTViewerModel,
  ASTViewerModelSimple,
} from './types';

import { hasChildInRange, isArrayInRange, isInRange } from './utils';

import styles from './ASTViewer.module.css';

import ItemGroup from './ItemGroup';
import HiddenItem from './HiddenItem';
import { SimpleItem } from './SimpleItem';

export function ComplexItem({
  value,
  onSelectNode,
  level,
  selection,
  propName,
  getTooltip,
}: GenericParams<ASTViewerModelComplex>): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => level === 'ast');
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const onHover = useCallback(
    (state: boolean) => {
      if (onSelectNode) {
        const range = value.range;
        if (range) {
          onSelectNode(state ? range : null);
        }
      }
    },
    [value],
  );

  useEffect(() => {
    const selected = selection
      ? value.type === 'array'
        ? isArrayInRange(selection, value)
        : isInRange(selection, value)
      : false;

    setIsSelected(
      level !== 'ast' && selected && !hasChildInRange(selection, value),
    );

    if (selected && !isExpanded) {
      setIsExpanded(selected);
    }
  }, [selection, value]);

  return (
    <ItemGroup
      propName={propName}
      value={value}
      isExpanded={isExpanded}
      isSelected={isSelected}
      canExpand={true}
      onHover={onHover}
      onClick={(): void => setIsExpanded(!isExpanded)}
    >
      <span>{value.type === 'array' ? '[' : '{'}</span>
      {isExpanded ? (
        <div className={styles.subList}>
          {value.value.map((item, index) => (
            <ElementItem
              level={`${level}_${item.key}[${index}]`}
              key={`${level}_${item.key}[${index}]`}
              getTooltip={getTooltip}
              selection={selection}
              value={item}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      ) : (
        <HiddenItem
          level={level}
          isArray={value.type === 'array'}
          value={value.value}
        />
      )}
      <span>{value.type === 'array' ? ']' : '}'}</span>
    </ItemGroup>
  );
}

export function ElementItem({
  level,
  getTooltip,
  selection,
  value,
  onSelectNode,
}: GenericParams<ASTViewerModel>): JSX.Element {
  if (value.type === 'array' || value.type === 'object') {
    return (
      <ComplexItem
        level={level}
        propName={value.key}
        getTooltip={getTooltip}
        selection={selection}
        onSelectNode={onSelectNode}
        value={value}
      />
    );
  } else {
    return (
      <SimpleItem
        getTooltip={getTooltip}
        value={value as ASTViewerModelSimple}
        onSelectNode={onSelectNode}
      />
    );
  }
}
