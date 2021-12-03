import React from 'react';

import ASTViewer from './ast/ASTViewer';
import { isRecord } from './ast/utils';
import type { ASTViewerBaseProps } from './ast/types';

function getNodeName(value: unknown): string | undefined {
  if (isRecord(value) && 'type' in value && value.type) {
    return String(value.type);
  }
  return undefined;
}

export default function ASTEsViewer(props: ASTViewerBaseProps): JSX.Element {
  return <ASTViewer getNodeName={getNodeName} {...props} />;
}
