import React, { useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps, ASTViewerModel } from './ast/types';
import type { TSESTree } from '@typescript-eslint/website-eslint';
import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode | string;
}

export default function ASTViewerESTree(
  props: ASTESTreeViewerProps,
): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModel>('');

  useEffect(() => {
    if (typeof props.value === 'string') {
      setModel(props.value);
    } else {
      const scopeSerializer = createESTreeSerializer();
      setModel(serialize(props.value, scopeSerializer));
    }
  }, [props.value]);

  return (
    <ASTViewer
      value={model}
      position={props.position}
      onSelectNode={props.onSelectNode}
    />
  );
}
