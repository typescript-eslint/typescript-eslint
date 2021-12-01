import React, { useCallback, useEffect, useState } from 'react';

import type { GenericParams } from './types';

import {
  hasChildInRange,
  isArrayInRange,
  isEsNode,
  isInRange,
  isRecord,
  propsToFilter,
} from './utils';

import PropertyValueComp from '@site/src/components/ast/PropertyValue';
import ItemGroup from '@site/src/components/ast/ItemGroup';
import HiddenItem from '@site/src/components/ast/HiddenItem';

import styles from '@site/src/components/ast/ASTViewer.module.css';

export const PropertyValue = React.memo(PropertyValueComp);

export function ComplexItem(
  props: GenericParams<Record<string, unknown> | unknown[]>,
): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    () => props.level === 'ast',
  );
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [model, setModel] = useState<[string, unknown][]>([]);

  useEffect(() => {
    setModel(
      Object.entries(props.value).filter(
        item =>
          !propsToFilter.includes(item[0]) &&
          !item[0].startsWith('_') &&
          item[1] !== undefined,
      ),
    );
  }, [props.value]);

  const onHover = useCallback(
    (state: boolean) => {
      if (props.onSelectNode && isEsNode(props.value)) {
        props.onSelectNode(state ? props.value.loc : null);
      }
    },
    [props.value],
  );

  useEffect(() => {
    const selected = props.isArray
      ? isArrayInRange(props.selection, props.value)
      : isInRange(props.selection, props.value);

    setIsSelected(
      props.level !== 'ast' &&
        selected &&
        !hasChildInRange(props.selection, model),
    );

    if (selected && !isExpanded) {
      setIsExpanded(selected);
    }
  }, [model, props.selection, props.value, props.isArray]);

  return (
    <ItemGroup
      propName={props.propName}
      value={props.value}
      isExpanded={isExpanded}
      isSelected={isSelected}
      typeName={props.getTypeName}
      canExpand={true}
      onHover={onHover}
      onClick={(): void => setIsExpanded(!isExpanded)}
    >
      <span>{props.isArray ? '[' : '{'}</span>
      {isExpanded ? (
        <div className={styles.subList}>
          {model.map((item, index) => (
            <ElementItem
              level={`${props.level}_${item[0]}[${index}]`}
              key={`${props.level}_${item[0]}[${index}]`}
              getTypeName={props.getTypeName}
              selection={props.selection}
              propName={item[0]}
              value={item[1]}
              onSelectNode={props.onSelectNode}
            />
          ))}
        </div>
      ) : (
        <HiddenItem level={props.level} isArray={props.isArray} value={model} />
      )}
      <span>{props.isArray ? ']' : '}'}</span>
    </ItemGroup>
  );
}

export function ElementItem(props: GenericParams<unknown>): JSX.Element {
  const isArray = Array.isArray(props.value);
  if (isArray || isRecord(props.value)) {
    return (
      <ComplexItem
        isArray={isArray}
        level={`${props.level}_${props.propName}`}
        propName={props.propName}
        getTypeName={props.getTypeName}
        value={props.value}
        selection={props.selection}
        onSelectNode={props.onSelectNode}
      />
    );
  }
  return (
    <ItemGroup
      propName={props.propName}
      value={props.value}
      typeName={props.getTypeName}
    >
      <PropertyValue value={props.value} />
    </ItemGroup>
  );
}
