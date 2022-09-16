import type { MouseEvent } from 'react';
import React, { useEffect, useRef } from 'react';
import { scrollIntoViewIfNeeded } from '@site/src/components/lib/scroll-into';
import clsx from 'clsx';

import styles from './ASTViewer.module.css';

import PropertyName from './PropertyName';
import type { ASTViewerModelMap } from './types';

export interface ItemGroupProps {
  readonly data: ASTViewerModelMap;
  readonly isSelected?: boolean;
  readonly isExpanded?: boolean;
  readonly canExpand?: boolean;
  readonly onClick?: (e: MouseEvent<HTMLElement>) => void;
  readonly onHover?: (e: boolean) => void;
  readonly children: JSX.Element | false | (JSX.Element | false)[];
}

export default function ItemGroup({
  data,
  isSelected,
  isExpanded,
  canExpand,
  onClick,
  onHover,
  children,
}: ItemGroupProps): JSX.Element {
  const listItem = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listItem.current && isSelected) {
      scrollIntoViewIfNeeded(listItem.current);
    }
  }, [isSelected, listItem]);

  return (
    <div
      ref={listItem}
      className={clsx(
        canExpand ? styles.expand : styles.nonExpand,
        isExpanded ? '' : styles.open,
        isSelected ? styles.selected : '',
      )}
    >
      <PropertyName
        propName={data.key}
        typeName={data.model.name}
        onHover={onHover}
        onClick={(canExpand && onClick) || undefined}
      />
      {React.Children.map(children, child => child)}
    </div>
  );
}
