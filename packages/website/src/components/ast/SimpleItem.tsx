import React, { useEffect, useState } from 'react';
import ItemGroup from './ItemGroup';
import Tooltip from '@site/src/components/inputs/Tooltip';
import PropertyValue from './PropertyValue';

import type { ASTViewerModelSimple, GetTooltipFn } from './types';

export interface SimpleItemProps {
  getTooltip?: GetTooltipFn;
  value: ASTViewerModelSimple;
}

export function SimpleItem({
  getTooltip,
  value,
}: SimpleItemProps): JSX.Element {
  const [tooltip, setTooltip] = useState<string | undefined>();

  useEffect(() => {
    setTooltip(getTooltip?.(value));
  }, [getTooltip, value]);

  return (
    <ItemGroup propName={value.key} value={value}>
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
