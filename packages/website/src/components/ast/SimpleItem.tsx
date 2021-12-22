import React, { useCallback, useEffect, useState } from 'react';
import ItemGroup from './ItemGroup';
import Tooltip from '@site/src/components/inputs/Tooltip';
import PropertyValue from './PropertyValue';

import type {
  ASTViewerModelMapSimple,
  GetTooltipFn,
  OnSelectNodeFn,
} from './types';

export interface SimpleItemProps {
  readonly getTooltip?: GetTooltipFn;
  readonly data: ASTViewerModelMapSimple;
  readonly onSelectNode?: OnSelectNodeFn;
}

export function SimpleItem({
  getTooltip,
  data,
  onSelectNode,
}: SimpleItemProps): JSX.Element {
  const [tooltip, setTooltip] = useState<string | undefined>();

  useEffect(() => {
    setTooltip(getTooltip?.(data));
  }, [getTooltip, data]);

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
      {tooltip ? (
        <Tooltip hover={true} position="right" text={tooltip}>
          <PropertyValue value={data} />
        </Tooltip>
      ) : (
        <PropertyValue value={data} />
      )}
    </ItemGroup>
  );
}
