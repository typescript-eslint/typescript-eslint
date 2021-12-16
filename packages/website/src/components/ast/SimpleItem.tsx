import React, { useCallback, useEffect, useState } from 'react';
import ItemGroup from './ItemGroup';
import Tooltip from '@site/src/components/inputs/Tooltip';
import PropertyValue from './PropertyValue';

import type { ASTViewerModelSimple, GetTooltipFn } from './types';
import { OnSelectNodeFn } from './types';

export interface SimpleItemProps {
  readonly getTooltip?: GetTooltipFn;
  readonly value: ASTViewerModelSimple;
  readonly onSelectNode?: OnSelectNodeFn;
}

export function SimpleItem({
  getTooltip,
  value,
  onSelectNode,
}: SimpleItemProps): JSX.Element {
  const [tooltip, setTooltip] = useState<string | undefined>();

  useEffect(() => {
    setTooltip(getTooltip?.(value));
  }, [getTooltip, value]);

  const onHover = useCallback(
    (state: boolean) => {
      if (onSelectNode && value.range) {
        onSelectNode(state ? value.range : null);
      }
    },
    [value],
  );

  return (
    <ItemGroup
      propName={value.key}
      value={value}
      onHover={value.range && onHover}
    >
      {tooltip ? (
        <Tooltip hover={true} position="right" text={tooltip}>
          <PropertyValue value={value} />
        </Tooltip>
      ) : (
        <PropertyValue value={value} />
      )}
    </ItemGroup>
  );
}
