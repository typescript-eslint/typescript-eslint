import React, { useMemo } from 'react';

import ASTViewer from './ast/ASTViewer';
import { serialize } from './ast/serializer/serializer';
import { createScopeSerializer } from './ast/serializer/serializerScope';
import type { ASTViewerBaseProps } from './ast/types';

export interface ASTScopeViewerProps extends ASTViewerBaseProps {
  readonly value: Record<string, unknown>;
}

export default function ASTViewerScope({
  value,
  onSelectNode,
}: ASTScopeViewerProps): JSX.Element {
  const model = useMemo(
    () => serialize(value, createScopeSerializer()),
    [value],
  );

  return <ASTViewer value={model} onSelectNode={onSelectNode} />;
}
