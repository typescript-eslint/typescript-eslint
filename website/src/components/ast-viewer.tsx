import React from 'react';
import styles from './ast-viewer.module.css';
import { TSESTree } from '@typescript-eslint/types';

interface PropertyNameProps {
  name?: string;
  propName?: string;
  onClick?: () => void;
}

const PropertyName = React.memo(function PropertyName({
  name,
  propName,
  onClick,
}: PropertyNameProps) {
  return (
    <span className={styles.tokenName} onClick={onClick}>
      {propName && <span className={styles.propName}>{propName}</span>}
      {propName && <span>: </span>}
      {name && <span className={styles.tokenName}>{name}</span>}
    </span>
  );
});

const PropertyValue = React.memo(function PropertyValue({
  value,
}: {
  value: unknown;
}) {
  if (typeof value === 'string') {
    return <span className={styles.propString}>{JSON.stringify(value)}</span>;
  } else if (typeof value === 'number') {
    return <span className={styles.propNumber}>{JSON.stringify(value)}</span>;
  }
  return <span>{JSON.stringify(value)}</span>;
});

function ElementItem(props: {
  name: string;
  value: unknown;
  level: string;
}): JSX.Element {
  if (Array.isArray(props.value)) {
    return (
      <li className={styles.toggle}>
        <span className={styles.propName}>{props.name}</span>
        <span>: </span>
        <span>[</span>
        <ul className={styles.subList}>
          {props.value.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              return (
                <Element
                  key={`${props.level}_${props.name}[${index}]`}
                  level={`${props.level}_${props.name}[${index}]`}
                  value={item}
                />
              );
            } else {
              return (
                <li key={`${props.level}_${props.name}[${index}]`}>
                  <PropertyValue value={item} />
                </li>
              );
            }
          })}
        </ul>
        <span>]</span>
      </li>
    );
  } else if (typeof props.value === 'object' && props.value !== null) {
    return (
      <Element
        level={`${props.level}_${props.name}`}
        propName={props.name}
        value={props.value as Record<string, unknown>}
      />
    );
  }
  return (
    <li className={styles.nonToggle}>
      <span className={styles.propName}>{props.name}</span>
      <span>: </span>
      <PropertyValue value={props.value} />
    </li>
  );
}

interface ElementProps {
  propName?: string;
  value: TSESTree.Node | Record<string, unknown>;
  level: string;
}

const propsToFilter = ['type', 'parent', 'comments', 'tokens', 'loc'];

function Element(props: ElementProps): JSX.Element {
  return (
    <li className={styles.toggle}>
      <PropertyName
        propName={props.propName}
        name={props.value.type as string | undefined}
      />
      <span> {'{'}</span>
      <ul className={styles.subList}>
        {Object.entries(props.value)
          .filter(item => !propsToFilter.includes(item[0]))
          .map((item, index) => (
            <ElementItem
              level={`${props.level}_${item[0]}[${index}]`}
              key={`${props.level}_${item[0]}[${index}]`}
              name={item[0]}
              value={item[1]}
            />
          ))}
      </ul>
      <span>{'}'}</span>
    </li>
  );
}

interface ASTViewerProps {
  ast: TSESTree.Node;
}

function ASTViewer(props: ASTViewerProps): JSX.Element {
  return (
    <ul className={styles.list}>
      <Element value={props.ast} level="ast" />
    </ul>
  );
}

export default ASTViewer;
