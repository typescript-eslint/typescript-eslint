import React, { MouseEvent, useEffect, useRef } from 'react';
import { scrollIntoViewIfNeeded } from '@site/src/components/lib/scroll-into';
import clsx from 'clsx';

import styles from './ASTViewer.module.css';

import PropertyName from './PropertyName';
import type { ASTViewerModel } from './types';

export interface ItemGroupProps {
  readonly propName?: string;
  readonly value: ASTViewerModel;
  readonly isSelected?: boolean;
  readonly isExpanded?: boolean;
  readonly canExpand?: boolean;
  readonly onClick?: (e: MouseEvent<HTMLElement>) => void;
  readonly onHover?: (e: boolean) => void;
  readonly children: JSX.Element | false | (JSX.Element | false)[];
}

export default function ItemGroup(props: ItemGroupProps): JSX.Element {
  const listItem = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listItem.current && props.isSelected) {
      scrollIntoViewIfNeeded(listItem.current);
    }
  }, [props.isSelected, listItem]);

  return (
    <div
      ref={listItem}
      className={clsx(
        props.canExpand ? styles.expand : styles.nonExpand,
        props.isExpanded ? '' : styles.open,
        props.isSelected ? styles.selected : '',
      )}
    >
      <PropertyName
        propName={props.propName}
        typeName={props.value.name}
        onMouseEnter={props.onHover}
        onMouseLeave={props.onHover}
        onClick={(props.canExpand && props.onClick) || undefined}
      />
      {React.Children.map(props.children, child => child)}
    </div>
  );
}
