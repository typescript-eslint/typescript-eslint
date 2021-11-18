import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './ASTViewer.module.css';
import type { TSESTree } from '@typescript-eslint/website-eslint';
import clsx from 'clsx';
import { scrollIntoViewIfNeeded } from '../lib/scroll-into';
import { filterRecord } from '../lib/selection';

import type { GenericParams } from './types';

import PropertyNameComp from './PropertyName';
import PropertyValueComp from './PropertyValue';

const PropertyName = React.memo(PropertyNameComp);
const PropertyValue = React.memo(PropertyValueComp);

function ElementArray(props: GenericParams<unknown[]>): JSX.Element {
  const isComplex = props.value.some(
    item => typeof item === 'object' && item !== null,
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(isComplex);

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

function ElementObject(
  props: GenericParams<TSESTree.Node | Record<string, unknown>>,
): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const listItem = useRef<HTMLDivElement | null>(null);

  const isSelected = props.selection === props.value;

  const onMouseEnter = useCallback((e: SyntheticEvent) => {
    if ('type' in props.value && 'loc' in props.value) {
      props.onSelectNode(props.value as TSESTree.Node);
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const onMouseLeave = useCallback((e: SyntheticEvent) => {
    if ('type' in props.value && 'loc' in props.value) {
      props.onSelectNode(null);
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    if (listItem.current && isSelected) {
      scrollIntoViewIfNeeded(listItem.current);
      setIsExpanded(true);
    }
  }, [props.selection, props.value, listItem]);

  return (
    <div
      ref={listItem}
      className={clsx(
        styles.expand,
        isExpanded ? '' : styles.open,
        isSelected ? styles.selected : '',
      )}
      onMouseMove={onMouseEnter}
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

function ElementItem(props: GenericParams<unknown>): JSX.Element {
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
    props.value !== null &&
    !(props.value instanceof RegExp)
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

function ASTViewer(props: {
  ast: TSESTree.Node | string;
  selection?: TSESTree.Node | null;
  onSelectNode: (node: TSESTree.Node | null) => void;
}): JSX.Element {
  return typeof props.ast === 'string' ? (
    <div>{props.ast}</div>
  ) : (
    <div className={styles.list}>
      <ElementObject
        value={props.ast}
        level="ast"
        selection={props.selection}
        onSelectNode={props.onSelectNode}
      />
    </div>
  );
}

export default ASTViewer;
