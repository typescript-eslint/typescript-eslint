import clsx from 'clsx';
import React, { type MouseEvent, useRef } from 'react';

import styles from './ASTViewer.module.css';
import PropertyName from './PropertyName';

export interface ItemGroupProps {
  readonly level: string;
  readonly propName?: string;
  readonly typeName?: string;
  readonly isSelected?: boolean;
  readonly isExpanded?: boolean;
  readonly canExpand?: boolean;
  readonly onClick?: (e: MouseEvent<HTMLElement>) => void;
  readonly onClickType?: (e: MouseEvent<HTMLElement>) => void;
  readonly onHover?: (e: boolean) => void;
  readonly children: JSX.Element | false | (JSX.Element | false)[];
}

export default function ItemGroup({
  level,
  propName,
  typeName,
  isSelected,
  isExpanded,
  canExpand,
  onClick,
  onClickType,
  onHover,
  children,
}: ItemGroupProps): JSX.Element {
  const listItem = useRef<HTMLDivElement | null>(null);

  return (
    <div
      data-level={level}
      ref={listItem}
      className={clsx(
        canExpand ? styles.expand : styles.nonExpand,
        isExpanded ? '' : styles.open,
        isSelected ? styles.selected : '',
      )}
    >
      <PropertyName
        propName={propName}
        typeName={typeName}
        onHover={onHover}
        onClickType={onClickType}
        onClick={(canExpand && onClick) || undefined}
      />
      {React.Children.map(children, child => child)}
    </div>
  );
}
