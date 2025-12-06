import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo } from 'react';

import type { OnHoverNodeFn, ParentNodeType } from './types';

import { useBool } from '../../hooks/useBool';
import Tooltip from '../inputs/Tooltip';
import styles from './ASTViewer.module.css';
import HiddenItem from './HiddenItem';
import PropertyName from './PropertyName';
import PropertyValue from './PropertyValue';
import {
  filterProperties,
  getNodeType,
  getRange,
  getTooltipLabel,
  getTypeName,
  isRecord,
} from './utils';

export interface JsonRenderProps<T> {
  readonly field?: string;
  readonly lastElement?: boolean;
  readonly level: string;
  readonly nodeType?: ParentNodeType;
  readonly onHover?: OnHoverNodeFn;
  readonly selectedPath?: string;
  readonly showTokens?: boolean;
  readonly typeName?: string;
  readonly value: T;
}

export interface ExpandableRenderProps extends JsonRenderProps<
  object | unknown[]
> {
  readonly closeBracket: string;
  readonly data: [string, unknown][];
  readonly openBracket: string;
}

function RenderExpandableObject({
  closeBracket,
  data,
  field,
  lastElement,
  level,
  nodeType,
  onHover,
  openBracket,
  selectedPath,
  showTokens,
  typeName,
  value,
}: ExpandableRenderProps): React.JSX.Element {
  const [expanded, toggleExpanded, setExpanded] = useBool(
    () => level === 'ast' || !!selectedPath?.startsWith(level),
  );

  const isActive = useMemo(
    () => level !== 'ast' && selectedPath === level,
    [selectedPath, level],
  );

  const onHoverItem = useCallback(
    (hover: boolean): void => {
      if (onHover) {
        if (hover) {
          onHover(getRange(value, nodeType));
        } else {
          onHover(undefined);
        }
      }
    },
    [onHover, value, nodeType],
  );

  useEffect(() => {
    const shouldOpen = !!selectedPath?.startsWith(level);
    if (shouldOpen) {
      setExpanded(current => current || shouldOpen);
    }
  }, [selectedPath, level, setExpanded]);

  const lastIndex = data.length - 1;

  return (
    <div
      className={clsx(
        styles.expand,
        !expanded && styles.open,
        isActive && styles.selected,
      )}
      data-level={level}
      role="list"
    >
      {field && (
        <PropertyName
          className={styles.propName}
          onClick={toggleExpanded}
          onHover={onHoverItem}
          value={field}
        />
      )}
      {field && <span>: </span>}
      {typeName && (
        <PropertyName
          className={styles.tokenName}
          onClick={toggleExpanded}
          onHover={onHoverItem}
          value={typeName}
        />
      )}
      {typeName && <span> </span>}
      <span>{openBracket}</span>

      {expanded ? (
        <div className={styles.subList}>
          {data.map((dataElement, index) => (
            <DataRender
              field={dataElement[0]}
              key={dataElement[0]}
              lastElement={index === lastIndex}
              level={`${level}.${dataElement[0]}`}
              nodeType={nodeType}
              onHover={onHover}
              selectedPath={selectedPath}
              showTokens={showTokens}
              value={dataElement[1]}
            />
          ))}
        </div>
      ) : (
        <HiddenItem isArray={openBracket === '['} level={level} value={data} />
      )}

      <span>{closeBracket}</span>
      {!lastElement && <span>,</span>}
    </div>
  );
}

function JsonObject(
  props: JsonRenderProps<Record<string, unknown>>,
): React.JSX.Element {
  const computed = useMemo(() => {
    const nodeType = getNodeType(props.value);
    return {
      nodeType,
      typeName: getTypeName(props.value, nodeType),
      value: Object.entries(props.value).filter(item =>
        filterProperties(item[0], item[1], nodeType, props.showTokens),
      ),
    };
  }, [props.value, props.showTokens]);

  return (
    <RenderExpandableObject
      {...props}
      closeBracket="}"
      data={computed.value}
      nodeType={computed.nodeType}
      openBracket="{"
      typeName={computed.typeName}
    />
  );
}

function JsonArray(props: JsonRenderProps<unknown[]>): React.JSX.Element {
  return (
    <RenderExpandableObject
      {...props}
      closeBracket="]"
      data={Object.entries(props.value)}
      openBracket="["
    />
  );
}

function JsonIterable(
  props: JsonRenderProps<Iterable<unknown>>,
): React.JSX.Element {
  return (
    <RenderExpandableObject
      {...props}
      closeBracket=")"
      data={Object.entries(props.value)}
      openBracket="("
    />
  );
}

function JsonPrimitiveValue({
  field,
  lastElement,
  nodeType,
  value,
}: JsonRenderProps<unknown>): React.JSX.Element {
  const tooltip = useMemo(() => {
    if (field && nodeType) {
      return getTooltipLabel(value, field, nodeType);
    }
    return undefined;
  }, [value, field, nodeType]);

  return (
    <div className={styles.valueBody} role="listitem">
      {field && <span className={styles.propName}>{field}: </span>}
      {tooltip ? (
        <Tooltip hover={true} position="right" text={tooltip}>
          <PropertyValue value={value} />
        </Tooltip>
      ) : (
        <PropertyValue value={value} />
      )}
      {!lastElement && <span className={styles.label}>,</span>}
    </div>
  );
}

export default function DataRender(
  props: JsonRenderProps<unknown>,
): React.JSX.Element {
  const value = props.value;

  if (Array.isArray(value)) {
    return <JsonArray {...props} value={value} />;
  }

  if (isRecord(value)) {
    return <JsonObject {...props} value={value} />;
  }

  if (value instanceof Map) {
    return <JsonIterable typeName="Map" {...props} value={value} />;
  }

  if (value instanceof Set) {
    return <JsonIterable typeName="Set" {...props} value={value} />;
  }

  return <JsonPrimitiveValue {...props} />;
}
