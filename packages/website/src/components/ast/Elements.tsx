import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import type { TSESTree } from '@typescript-eslint/website-eslint';
import type { GenericParams } from './types';

import { scrollIntoViewIfNeeded } from '@site/src/components/lib/scroll-into';
import {
  filterRecord,
  hasChildInRange,
  isArrayInRange,
  isEsNode,
  isInRange,
  isRecord,
} from './selection';

import PropertyNameComp from '@site/src/components/ast/PropertyName';
import PropertyValueComp from '@site/src/components/ast/PropertyValue';
import styles from '@site/src/components/ast/ASTViewer.module.css';

export const PropertyName = React.memo(PropertyNameComp);
export const PropertyValue = React.memo(PropertyValueComp);

export function ElementArray(props: GenericParams<unknown[]>): JSX.Element {
  const [isComplex, setIsComplex] = useState<boolean>(() =>
    isRecord(props.value),
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(
    () =>
      isComplex || props.value.some(item => isInRange(props.selection, item)),
  );

  useEffect(() => {
    setIsComplex(
      props.value.some(item => typeof item === 'object' && item !== null),
    );
  }, [props.value]);

  useEffect(() => {
    if (isComplex && !isExpanded) {
      setIsExpanded(isArrayInRange(props.selection, props.value));
    }
  }, [props.value, props.selection]);

  return (
    <div className={clsx(styles.expand, isExpanded ? '' : styles.open)}>
      <PropertyName
        propName={props.name}
        onClick={(): void => setIsExpanded(!isExpanded)}
      />
      <span>[</span>
      {isExpanded ? (
        <div className={styles.subList}>
          {props.value.map((item, index) => {
            return (
              <ElementItem
                level={`${props.level}_${props.name}[${index}]`}
                key={`${props.level}_${props.name}[${index}]`}
                value={item}
                selection={props.selection}
                onSelectNode={props.onSelectNode}
              />
            );
          })}
        </div>
      ) : !isComplex ? (
        <span className={styles.hidden}>
          {props.value.map((item, index) => (
            <span key={`${props.level}_${props.name}|[${index}]`}>
              {index > 0 && ', '}
              <PropertyValue value={item} />
            </span>
          ))}
        </span>
      ) : (
        <span className={styles.hidden}>
          {props.value.length} {props.value.length > 1 ? 'elements' : 'element'}
        </span>
      )}
      <span>]</span>
    </div>
  );
}

export function ElementObject(
  props: GenericParams<TSESTree.Node | Record<string, unknown>>,
): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    return isInRange(props.selection, props.value);
  });
  const [isSelected, setIsSelected] = useState<boolean>(
    () =>
      isInRange(props.selection, props.value) && props.value.type !== 'Program',
  );
  const listItem = useRef<HTMLDivElement | null>(null);

  const onMouseEnter = useCallback(
    (e: SyntheticEvent) => {
      if (isEsNode(props.value)) {
        props.onSelectNode(props.value as TSESTree.Node);
        e.stopPropagation();
        e.preventDefault();
      }
    },
    [props.value],
  );

  const onMouseLeave = useCallback(
    (_e: SyntheticEvent) => {
      if (isEsNode(props.value)) {
        props.onSelectNode(null);
      }
    },
    [props.value],
  );

  useEffect(() => {
    const selected = isInRange(props.selection, props.value);

    setIsSelected(
      selected &&
        props.value.type !== 'Program' &&
        !hasChildInRange(props.selection, props.value),
    );

    if (selected && !isExpanded) {
      setIsExpanded(isInRange(props.selection, props.value));
    }
  }, [props.selection, props.value]);

  useEffect(() => {
    if (listItem.current && isSelected) {
      scrollIntoViewIfNeeded(listItem.current);
    }
  }, [isSelected, listItem]);

  return (
    <div
      ref={listItem}
      className={clsx(
        styles.expand,
        isExpanded ? '' : styles.open,
        isSelected ? styles.selected : '',
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <PropertyName
        propName={props.propName}
        name={props.value.type as string | undefined}
        onClick={(): void => setIsExpanded(!isExpanded)}
      />
      <span> {'{'}</span>
      {isExpanded ? (
        <div className={styles.subList}>
          {filterRecord(props.value).map((item, index) => (
            <ElementItem
              level={`${props.level}_${item[0]}[${index}]`}
              key={`${props.level}_${item[0]}[${index}]`}
              selection={props.selection}
              name={item[0]}
              value={item[1]}
              onSelectNode={props.onSelectNode}
            />
          ))}
        </div>
      ) : (
        <span className={styles.hidden}>
          {filterRecord(props.value)
            .map(item => item[0])
            .join(', ')}
        </span>
      )}
      <span>{'}'}</span>
    </div>
  );
}

export function ElementItem(props: GenericParams<unknown>): JSX.Element {
  if (Array.isArray(props.value)) {
    return (
      <ElementArray
        name={props.name}
        value={props.value}
        level={props.level}
        selection={props.selection}
        onSelectNode={props.onSelectNode}
      />
    );
  } else if (
    typeof props.value === 'object' &&
    props.value &&
    props.value.constructor === Object
  ) {
    return (
      <ElementObject
        level={`${props.level}_${props.name}`}
        propName={props.name}
        value={props.value as Record<string, unknown>}
        selection={props.selection}
        onSelectNode={props.onSelectNode}
      />
    );
  }
  return (
    <div className={styles.nonExpand}>
      {props.name && <span className={styles.propName}>{props.name}</span>}
      {props.name && <span>: </span>}
      <PropertyValue value={props.value} />
    </div>
  );
}
