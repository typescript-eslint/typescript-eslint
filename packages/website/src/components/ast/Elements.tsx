import React, { useEffect, useMemo, useState } from 'react';

import Tooltip from '../inputs/Tooltip';
import styles from './ASTViewer.module.css';
import HiddenItem from './HiddenItem';
import ItemGroup from './ItemGroup';
import PropertyValue from './PropertyValue';
import type {
  GetTooltipLabelFn,
  GetTypeNameFN,
  OnHoverNodeFn,
  ParentNodeType,
} from './types';
import { filterProperties, getNodeType, getRange, objType } from './utils';

export interface ElementItemProps {
  readonly getTypeName: GetTypeNameFN;
  readonly getTooltipLabel: GetTooltipLabelFn;
  readonly propName?: string;
  readonly level: string;
  readonly value: unknown;
  readonly onHoverNode?: OnHoverNodeFn;
  readonly parentNodeType?: ParentNodeType;
  readonly selectedPath?: string;
}

interface ComputedValueIterable {
  type: string;
  group: 'iterable';
  typeName: string | undefined;
  nodeType: ParentNodeType;
  value: [string, unknown][];
  range?: [number, number];
}

interface ComputedValueSimple {
  type: string;
  group: 'simple';
  tooltip?: string;
}

type ComputedValue = ComputedValueIterable | ComputedValueSimple;

function getValues(value: object | unknown[]): [string, unknown][] {
  if (value instanceof Map) {
    return Array.from(value.entries()) as [string, unknown][];
  }
  if (value instanceof Set) {
    return Array.from(value.entries()) as [string, unknown][];
  }
  return Object.entries(value);
}

export function ElementItem({
  level,
  selectedPath,
  propName,
  value,
  onHoverNode,
  getTypeName,
  getTooltipLabel,
  parentNodeType,
}: ElementItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => level === 'ast');
  const isSelected = useMemo(() => {
    return selectedPath === level && level !== 'ast';
  }, [selectedPath, level]);

  const computedValue = useMemo((): ComputedValue => {
    const type = objType(value);
    if (value instanceof Error) {
      return {
        type: type,
        group: 'simple',
      };
    } else if ((value && typeof value === 'object') || Array.isArray(value)) {
      const nodeType = getNodeType(type, value);
      return {
        type: type,
        group: 'iterable',
        typeName: getTypeName(type, value, propName, nodeType),
        nodeType: nodeType,
        value: getValues(value).filter(item =>
          filterProperties(item[0], item[1], nodeType),
        ),
        range: getRange(value, nodeType),
      };
    } else {
      return {
        type: type,
        group: 'simple',
        tooltip: getTooltipLabel(type, value, propName, parentNodeType),
      };
    }
  }, [value, propName, getTypeName, getTooltipLabel, parentNodeType]);

  useEffect(() => {
    const shouldOpen = !!selectedPath?.startsWith(level);
    if (shouldOpen) {
      setIsExpanded(current => current || shouldOpen);
    }
  }, [selectedPath, level]);

  if (computedValue.group === 'iterable') {
    return (
      <ItemGroup
        level={level}
        propName={propName}
        typeName={computedValue.typeName}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onHover={(v): void =>
          onHoverNode?.(v ? computedValue.range : undefined)
        }
        canExpand={true}
        onClick={(): void => setIsExpanded(!isExpanded)}
      >
        <span>{computedValue.type === 'Array' ? '[' : '{'}</span>
        {isExpanded ? (
          <>
            <div className={styles.subList}>
              {computedValue.value.map(([key, item]) => (
                <ElementItem
                  level={`${level}.${key}`}
                  key={`${level}.${key}`}
                  selectedPath={selectedPath}
                  value={item}
                  propName={key}
                  onHoverNode={onHoverNode}
                  getTypeName={getTypeName}
                  getTooltipLabel={getTooltipLabel}
                  parentNodeType={computedValue.nodeType}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <HiddenItem
              level={level}
              isArray={computedValue.type === 'Array'}
              value={computedValue.value}
            />
          </>
        )}
        <span>{computedValue.type === 'Array' ? ']' : '}'}</span>
      </ItemGroup>
    );
  } else {
    return (
      <ItemGroup level={level} propName={propName}>
        {computedValue.tooltip ? (
          <Tooltip hover={true} position="right" text={computedValue.tooltip}>
            <PropertyValue value={value} />
          </Tooltip>
        ) : (
          <PropertyValue value={value} />
        )}
      </ItemGroup>
    );
  }
}
