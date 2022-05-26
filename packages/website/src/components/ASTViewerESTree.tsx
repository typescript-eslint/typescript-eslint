import React, { useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps, ASTViewerModelMap } from './ast/types';
import type { TSESTree } from '@typescript-eslint/utils';
import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode;
}

export default function ASTViewerESTree({
  value,
  position,
  onSelectNode,
}: ASTESTreeViewerProps): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModelMap>('');

  useEffect(() => {
    const astSerializer = createESTreeSerializer();
    setModel(serialize(value, astSerializer));
  }, [value]);

  return (
    <ASTViewer value={model} position={position} onSelectNode={onSelectNode} />
  );
}
