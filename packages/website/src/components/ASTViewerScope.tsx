import React, { useMemo } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps } from './ast/types';

import { serialize } from './ast/serializer/serializer';
import { createScopeSerializer } from './ast/serializer/serializerScope';

export interface ASTScopeViewerProps extends ASTViewerBaseProps {
  readonly value: Record<string, unknown>;
}

const scopeSerializer = createScopeSerializer();

export default function ASTViewerScope({
  value,
  onSelectNode,
}: ASTScopeViewerProps): JSX.Element {
  const model = useMemo(() => serialize(value, scopeSerializer), [value]);

  return <ASTViewer value={model} onSelectNode={onSelectNode} />;
}
