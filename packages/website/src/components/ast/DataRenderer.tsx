import clsx from 'clsx';
import type { Dispatch, SetStateAction } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Tooltip from '../inputs/Tooltip';
import styles from './ASTViewer.module.css';
import HiddenItem from './HiddenItem';
import PropertyName from './PropertyName';
import PropertyValue from './PropertyValue';
import type { OnHoverNodeFn, ParentNodeType } from './types';
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
  readonly typeName?: string;
  readonly nodeType?: ParentNodeType;
  readonly value: T;
  readonly lastElement?: boolean;
  readonly level: string;
  readonly onHover?: OnHoverNodeFn;
  readonly selectedPath?: string;
}

export interface ExpandableRenderProps
  extends JsonRenderProps<unknown[] | object> {
  readonly data: [string, unknown][];
  readonly openBracket: string;
  readonly closeBracket: string;
}

function useBool(
  initialValueCreator: () => boolean,
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(initialValueCreator());

  const toggle = (): void => setValue(currentValue => !currentValue);

  return [value, toggle, setValue];
}

function RenderExpandableObject({
  field,
  typeName,
  nodeType,
  data,
  lastElement,
  openBracket,
  closeBracket,
  value,
  level,
  onHover,
  selectedPath,
}: ExpandableRenderProps): JSX.Element {
  const [expanded, toggleExpanded, setExpanded] = useBool(
    () => selectedPath === level && level !== 'ast',
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
    [onHover],
  );

  useEffect(() => {
    const shouldOpen = !!selectedPath?.startsWith(level);
    if (shouldOpen) {
      setExpanded(current => current || shouldOpen);
    }
  }, [selectedPath, level]);

  const lastIndex = data.length - 1;

  return (
    <div
      className={clsx(
        styles.expand,
        !expanded && styles.open,
        isActive && styles.selected,
      )}
      role="list"
      data-level={level}
    >
      {field && (
        <PropertyName
          value={field}
          onClick={toggleExpanded}
          className={styles.propName}
          onHover={onHoverItem}
        />
      )}
      {field && <span>: </span>}
      {typeName && (
        <PropertyName
          value={typeName}
          onClick={toggleExpanded}
          className={styles.tokenName}
          onHover={onHoverItem}
        />
      )}
      {typeName && <span> </span>}
      <span>{openBracket}</span>

      {expanded ? (
        <div className={styles.subList}>
          {data.map((dataElement, index) => (
            <DataRender
              key={dataElement[0] ?? index}
              field={dataElement[0]}
              value={dataElement[1]}
              lastElement={index === lastIndex}
              level={`${level}.${dataElement[0]}`}
              onHover={onHover}
              selectedPath={selectedPath}
              nodeType={nodeType}
            />
          ))}
        </div>
      ) : (
        <HiddenItem value={data} level={level} isArray={openBracket === '['} />
      )}

      <span>{closeBracket}</span>
      {!lastElement && <span>,</span>}
    </div>
  );
}

function JsonObject(
  props: JsonRenderProps<Record<string, unknown>>,
): JSX.Element {
  const computed = useMemo(() => {
    const nodeType = getNodeType(props.value);
    return {
      nodeType: nodeType,
      typeName: getTypeName(props.value, nodeType),
      value: Object.entries(props.value).filter(item =>
        filterProperties(item[0], item[1], nodeType),
      ),
    };
  }, [props.value]);

  return (
    <RenderExpandableObject
      {...props}
      data={computed.value}
      openBracket="{"
      closeBracket="}"
      nodeType={computed.nodeType}
      typeName={computed.typeName}
    />
  );
}

function JsonArray(props: JsonRenderProps<unknown[]>): JSX.Element {
  return (
    <RenderExpandableObject
      {...props}
      data={Object.entries(props.value)}
      openBracket="["
      closeBracket="]"
    />
  );
}

function JsonIterable(props: JsonRenderProps<Iterable<unknown>>): JSX.Element {
  return (
    <RenderExpandableObject
      {...props}
      data={Object.entries(props.value)}
      openBracket="{"
      closeBracket="}"
    />
  );
}

function JsonPrimitiveValue({
  field,
  value,
  nodeType,
  lastElement,
}: JsonRenderProps<unknown>): JSX.Element {
  const tooltip = useMemo(() => {
    if (field && nodeType) {
      return getTooltipLabel(value, field, nodeType);
    }
    return undefined;
  }, [value, field, nodeType]);

  return (
    <div role="listitem" className={styles.valueBody}>
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
): JSX.Element {
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
