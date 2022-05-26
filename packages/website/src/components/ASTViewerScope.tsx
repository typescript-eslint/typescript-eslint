import React, { useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps, ASTViewerModelMap } from './ast/types';

import { serialize } from './ast/serializer/serializer';
import { createScopeSerializer } from './ast/serializer/serializerScope';

export interface ASTScopeViewerProps extends ASTViewerBaseProps {
  readonly value: Record<string, unknown>;
}

export default function ASTViewerScope({
  value,
  onSelectNode,
}: ASTScopeViewerProps): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModelMap>('');

  useEffect(() => {
    const scopeSerializer = createScopeSerializer();
    setModel(serialize(value, scopeSerializer));
  }, [value]);

  return <ASTViewer value={model} onSelectNode={onSelectNode} />;
}
