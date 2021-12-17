import React, { useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps, ASTViewerModel } from './ast/types';

import { serialize } from './ast/serializer/serializer';
import { createScopeSerializer } from './ast/serializer/serializerScope';

export interface ASTScopeViewerProps extends ASTViewerBaseProps {
  readonly value: Record<string, unknown> | string;
}

export default function ASTViewerScope({
  value,
  onSelectNode,
}: ASTScopeViewerProps): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModel>('');

  useEffect(() => {
    if (typeof value === 'string') {
      setModel(value);
    } else {
      const scopeSerializer = createScopeSerializer();
      setModel(serialize(value, scopeSerializer));
    }
  }, [value]);

  return <ASTViewer value={model} onSelectNode={onSelectNode} />;
}
