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

export function ComplexItem(
  props: GenericParams<ASTViewerModelComplex>,
): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    () => props.level === 'ast',
  );
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const onHover = useCallback(
    (state: boolean) => {
      if (props.onSelectNode) {
        const range = props.value.range;
        if (range) {
          props.onSelectNode(state ? range : null);
        }
      }
    },
    [props.value],
  );

  useEffect(() => {
    const selected = props.selection
      ? props.value.type === 'array'
        ? isArrayInRange(props.selection, props.value)
        : isInRange(props.selection, props.value)
      : false;

    setIsSelected(
      props.level !== 'ast' &&
        selected &&
        !hasChildInRange(props.selection, props.value),
    );

    if (selected && !isExpanded) {
      setIsExpanded(selected);
    }
  }, [props.selection, props.value]);

  return (
    <ItemGroup
      propName={props.propName}
      value={props.value}
      isExpanded={isExpanded}
      isSelected={isSelected}
      canExpand={true}
      onHover={onHover}
      onClick={(): void => setIsExpanded(!isExpanded)}
    >
      <span>{props.value.type === 'array' ? '[' : '{'}</span>
      {isExpanded ? (
        <div className={styles.subList}>
          {props.value.value.map((item, index) => (
            <ElementItem
              level={`${props.level}_${item.key}[${index}]`}
              key={`${props.level}_${item.key}[${index}]`}
              getTooltip={props.getTooltip}
              selection={props.selection}
              value={item}
              onSelectNode={props.onSelectNode}
            />
          ))}
        </div>
      ) : (
        <HiddenItem
          level={props.level}
          isArray={props.value.type === 'array'}
          value={props.value.value}
        />
      )}
      <span>{props.value.type === 'array' ? ']' : '}'}</span>
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
      />
    );
  }
}
