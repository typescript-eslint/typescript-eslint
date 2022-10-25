import type { TSESTree } from '@typescript-eslint/utils';
import React, { useMemo } from 'react';

import ASTViewer from './ast/ASTViewer';
import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';
import type { ASTViewerBaseProps } from './ast/types';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode | TSESTree.Program;
}

export default function ASTViewerESTree({
  value,
  position,
  onSelectNode,
}: ASTESTreeViewerProps): JSX.Element {
  const model = useMemo(
    () => serialize(value, createESTreeSerializer()),
    [value],
  );

  return (
    <ASTViewer value={model} position={position} onSelectNode={onSelectNode} />
  );
}
