import Tooltip from '@site/src/components/inputs/Tooltip';
import React, { useCallback } from 'react';

import ItemGroup from './ItemGroup';
import PropertyValue from './PropertyValue';
import type { ASTViewerModelMapSimple, OnSelectNodeFn } from './types';

export interface SimpleItemProps {
  readonly data: ASTViewerModelMapSimple;
  readonly onSelectNode?: OnSelectNodeFn;
}

export function SimpleItem({
  data,
  onSelectNode,
}: SimpleItemProps): JSX.Element {
  const onHover = useCallback(
    (state: boolean) => {
      if (onSelectNode && data.model.range) {
        onSelectNode(state ? data.model.range : null);
      }
    },
    [data],
  );

  return (
    <ItemGroup data={data} onHover={data.model.range && onHover}>
      {data.model.tooltip ? (
        <Tooltip hover={true} position="right" text={data.model.tooltip}>
          <PropertyValue value={data} />
        </Tooltip>
      ) : (
        <PropertyValue value={data} />
      )}
    </ItemGroup>
  );
}
