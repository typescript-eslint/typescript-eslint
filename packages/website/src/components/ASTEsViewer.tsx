import React from 'react';

import ASTViewer, { ASTViewerBaseProps } from './ast/ASTViewer';
import { isRecord } from './ast/utils';

function getTypeName(value: unknown): string | undefined {
  if (isRecord(value) && 'type' in value && value.type) {
    return String(value.type);
  }
  return undefined;
}

export default function ASTEsViewer(props: ASTViewerBaseProps): JSX.Element {
  return <ASTViewer getTypeName={getTypeName} {...props} />;
}
