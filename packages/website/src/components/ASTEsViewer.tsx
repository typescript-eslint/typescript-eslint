import React from 'react';

import ASTViewer from './ast/ASTViewer';
import { isRecord } from './ast/utils';
import type { ASTViewerBaseProps, SelectedRange } from './ast/types';
import { TSESTree } from '@typescript-eslint/website-eslint';

function isEsNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.BaseNode {
  return isRecord(value) && 'type' in value && 'loc' in value;
}

function getNodeName(value: unknown): string | undefined {
  if (isEsNode(value)) {
    return String(value.type);
  }
  return undefined;
}

function getRange(value: unknown): SelectedRange | undefined {
  if (isEsNode(value)) {
    return {
      start: value.loc.start,
      end: value.loc.end,
    };
  }
  return undefined;
}

export default function ASTEsViewer(props: ASTViewerBaseProps): JSX.Element {
  return <ASTViewer getRange={getRange} getNodeName={getNodeName} {...props} />;
}
