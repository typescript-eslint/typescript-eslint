import React from 'react';

import ASTViewer, { ASTViewerBaseProps } from './ast/ASTViewer';
import { isRecord } from './ast/utils';

const cache: Record<string, Record<number, string>> = {};

export function getSyntaxKind(): Record<number, string> {
  if (!cache[window.ts.version]) {
    const result: Record<number, string> = {};
    const keys = Object.keys(window.ts.SyntaxKind).filter(k =>
      isNaN(parseInt(k, 10)),
    );
    for (const name of keys) {
      const value = Number(window.ts.SyntaxKind[name]);
      if (!(value in result)) {
        result[value] = name;
      }
    }
    cache[window.ts.version] = result;
  }
  return cache[window.ts.version];
}

function getTypeName(value: unknown): string | undefined {
  if (isRecord(value) && typeof value.kind === 'number') {
    return getSyntaxKind()[value.kind];
  }
  return undefined;
}

export default function ASTTsViewer(props: ASTViewerBaseProps): JSX.Element {
  return <ASTViewer getTypeName={getTypeName} ast={props.ast} />;
}
