import React, { useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps, ASTViewerModel } from './ast/types';

import { serialize } from './ast/serializer/serializer';
import { createScopeSerializer } from './ast/serializer/serializerScope';

export interface ASTScopeViewerProps extends ASTViewerBaseProps {
  readonly value: Record<string, unknown> | string;
}

export default function ASTViewerScope(
  props: ASTScopeViewerProps,
): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModel>('');

  useEffect(() => {
    if (typeof props.value === 'string') {
      setModel(props.value);
    } else {
      const scopeSerializer = createScopeSerializer();
      setModel(serialize(props.value, scopeSerializer));
    }
  }, [props.value]);

  return <ASTViewer value={model} onSelectNode={props.onSelectNode} />;
}
