import React from 'react';

import ASTViewer, { ASTViewerBaseProps } from './ast/ASTViewer';
import { isRecord } from './ast/utils';

function getTypeName(value: unknown): string | undefined {
  if (
    isRecord(value) &&
    typeof value.kind === 'number' &&
    window.ts.SyntaxKind[value.kind]
  ) {
    return String(window.ts.SyntaxKind[value.kind]);
  }
  return undefined;
}

export default function ASTTsViewer(props: ASTViewerBaseProps): JSX.Element {
  return <ASTViewer getTypeName={getTypeName} ast={props.ast} />;
}
