import React, { useMemo } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps } from './ast/types';
import type { TSESTree } from '@typescript-eslint/utils';

import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode;
}

const astSerializer = createESTreeSerializer();

export default function ASTViewerESTree({
  value,
  position,
  onSelectNode,
}: ASTESTreeViewerProps): JSX.Element {
  const model = useMemo(() => serialize(value, astSerializer), [value]);

  return (
    <ASTViewer value={model} position={position} onSelectNode={onSelectNode} />
  );
}
