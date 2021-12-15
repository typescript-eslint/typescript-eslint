import React, { useCallback, useEffect, useState } from 'react';

import type { GenericParams } from './types';

import { hasChildInRange, isArrayInRange, isInRange, isRecord } from './utils';

import styles from '@site/src/components/ast/ASTViewer.module.css';

import PropertyValue from '@site/src/components/ast/PropertyValue';
import ItemGroup from '@site/src/components/ast/ItemGroup';
import HiddenItem from '@site/src/components/ast/HiddenItem';
import Tooltip from '@site/src/components/inputs/Tooltip';

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
      Object.entries(props.value).filter(item => props.filterProps(item)),
    );
  }, [props.value, props.filterProps]);

  const onHover = useCallback(
    (state: boolean) => {
      if (props.onSelectNode) {
        const range = props.getRange(props.value);
        if (range) {
          props.onSelectNode(state ? range : null);
        }
      }
    },
    [props.value],
  );

  useEffect(() => {
    const selected = props.selection
      ? props.isArray
        ? isArrayInRange(props.selection, props.value, props.getRange)
        : isInRange(props.selection, props.value, props.getRange)
      : false;

    setIsSelected(
      props.level !== 'ast' &&
        selected &&
        !hasChildInRange(props.selection, model, props.getRange),
    );

    if (selected && !isExpanded) {
      setIsExpanded(selected);
    }
  }, [model, props.selection, props.value, props.isArray, props.getRange]);

  return (
    <ItemGroup
      propName={props.propName}
      value={props.value}
      isExpanded={isExpanded}
      isSelected={isSelected}
      getNodeName={props.getNodeName}
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
              getNodeName={props.getNodeName}
              getTooltip={props.getTooltip}
              getRange={props.getRange}
              filterProps={props.filterProps}
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

export function SimpleItem(props: GenericParams<unknown>): JSX.Element {
  const [tooltip, setTooltip] = useState<string | undefined>();

  useEffect(() => {
    setTooltip(props.getTooltip?.(props.propName ?? '', props.value));
  }, [props.getTooltip, props.propName, props.value]);

  return (
    <ItemGroup
      propName={props.propName}
      value={props.value}
      getNodeName={props.getNodeName}
    >
      {tooltip ? (
        <Tooltip hover={true} position="right" text={tooltip}>
          <PropertyValue value={props.value} />
        </Tooltip>
      ) : (
        <PropertyValue value={props.value} />
      )}
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
        getNodeName={props.getNodeName}
        getTooltip={props.getTooltip}
        getRange={props.getRange}
        filterProps={props.filterProps}
        value={props.value}
        selection={props.selection}
        onSelectNode={props.onSelectNode}
      />
    );
  } else {
    return <SimpleItem {...props} />;
  }
}
