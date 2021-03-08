import React, { SyntheticEvent, useCallback, useState } from 'react';
import styles from './ast-viewer.module.css';
import type { TSESTree } from '@typescript-eslint/types';
import clsx from 'clsx';

const propsToFilter = ['parent', 'comments', 'tokens', 'loc'];

function filterRecord(
  values: TSESTree.Node | Record<string, unknown>,
): [string, unknown][] {
  return Object.entries(values).filter(
    item => !propsToFilter.includes(item[0]),
  );
}

const PropertyName = React.memo(function PropertyName(props: {
  name?: string;
  propName?: string;
  onClick?: (e: SyntheticEvent) => void;
  onMouseEnter?: (e: SyntheticEvent) => void;
}) {
  return (
    <span onClick={props.onClick} onMouseEnter={props.onMouseEnter}>
      {props.propName && (
        <span className={clsx(styles.propName, styles.clickable)}>
          {props.propName}
        </span>
      )}
      {props.propName && <span>: </span>}
      {props.name && (
        <span className={clsx(styles.tokenName, styles.clickable)}>
          {props.name}
        </span>
      )}
    </span>
  );
});

const PropertyValue = React.memo(function PropertyValue(props: {
  value: unknown;
}) {
  if (typeof props.value === 'string') {
    return (
      <span className={styles.propString}>{JSON.stringify(props.value)}</span>
    );
  } else if (typeof props.value === 'number') {
    return <span className={styles.propNumber}>{props.value}</span>;
  } else if (typeof props.value === 'bigint') {
    return <span className={styles.propNumber}>{String(props.value)}n</span>;
  } else if (typeof props.value === 'boolean') {
    return (
      <span className={styles.propBoolean}>
        {props.value ? 'true' : 'false'}
      </span>
    );
  }
  return <span>{String(props.value)}</span>;
});

function ElementArray(props: {
  name?: string;
  value: unknown[];
  level: string;
  onSelectNode: (node: TSESTree.Node | null) => void;
}): JSX.Element {
  const isComplex = props.value.some(
    item => typeof item === 'object' && item !== null,
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(isComplex);

  return (
    <li className={clsx(styles.expand, isExpanded ? '' : styles.open)}>
      <PropertyName
        propName={props.name}
        onClick={(): void => setIsExpanded(!isExpanded)}
      />
      <span>[</span>
      {isExpanded ? (
        <ul className={styles.subList}>
          {props.value.map((item, index) => {
            return (
              <ElementItem
                level={`${props.level}_${props.name}[${index}]`}
                key={`${props.level}_${props.name}[${index}]`}
                value={item}
                onSelectNode={props.onSelectNode}
              />
            );
          })}
        </ul>
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
    </li>
  );
}

function ElementObject(props: {
  propName?: string;
  value: TSESTree.Node | Record<string, unknown>;
  onSelectNode: (node: TSESTree.Node | null) => void;
  level: string;
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

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

  return (
    <li
      className={clsx(styles.expand, isExpanded ? '' : styles.open)}
      onMouseMove={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <PropertyName
        onMouseEnter={onMouseEnter}
        propName={props.propName}
        name={props.value.type as string | undefined}
        onClick={(): void => setIsExpanded(!isExpanded)}
      />
      <span> {'{'}</span>
      {isExpanded ? (
        <ul className={styles.subList}>
          {filterRecord(props.value).map((item, index) => (
            <ElementItem
              level={`${props.level}_${item[0]}[${index}]`}
              key={`${props.level}_${item[0]}[${index}]`}
              name={item[0]}
              value={item[1]}
              onSelectNode={props.onSelectNode}
            />
          ))}
        </ul>
      ) : (
        <span className={styles.hidden}>
          {filterRecord(props.value)
            .map(item => item[0])
            .join(', ')}
        </span>
      )}
      <span>{'}'}</span>
    </li>
  );
}

function ElementItem(props: {
  name?: string;
  value: unknown;
  level: string;
  onSelectNode: (node: TSESTree.Node | null) => void;
}): JSX.Element {
  if (Array.isArray(props.value)) {
    return (
      <ElementArray
        name={props.name}
        value={props.value}
        level={props.level}
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
        onSelectNode={props.onSelectNode}
      />
    );
  }
  return (
    <li className={styles.nonExpand}>
      {props.name && <span className={styles.propName}>{props.name}</span>}
      {props.name && <span>: </span>}
      <PropertyValue value={props.value} />
    </li>
  );
}

function ASTViewer(props: {
  ast: TSESTree.Node | string;
  onSelectNode: (node: TSESTree.Node | null) => void;
}): JSX.Element {
  return typeof props.ast === 'string' ? (
    <div>{props.ast}</div>
  ) : (
    <ul className={styles.list}>
      <ElementObject
        value={props.ast}
        level="ast"
        onSelectNode={props.onSelectNode}
      />
    </ul>
  );
}

export default ASTViewer;
