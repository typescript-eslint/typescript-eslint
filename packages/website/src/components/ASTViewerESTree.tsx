import React, { useCallback } from 'react';

import ASTViewer from './ast/ASTViewer';
import { isRecord } from './ast/utils';
import type { ASTViewerBaseProps, SelectedRange } from './ast/types';
import { TSESTree } from '@typescript-eslint/website-eslint';

function isESTreeNode(
  value: unknown,
): value is Record<string, unknown> & TSESTree.BaseNode {
  return isRecord(value) && 'type' in value && 'loc' in value;
}

export const propsToFilter = ['parent', 'comments', 'tokens'];

export default function ASTViewerESTree(
  props: ASTViewerBaseProps,
): JSX.Element {
  const filterProps = useCallback(
    (item: [string, unknown]): boolean =>
      !propsToFilter.includes(item[0]) &&
      !item[0].startsWith('_') &&
      item[1] !== undefined,
    [],
  );

  const getRange = useCallback(
    (value: unknown): SelectedRange | undefined =>
      isESTreeNode(value)
        ? {
            start: value.loc.start,
            end: value.loc.end,
          }
        : undefined,
    [],
  );

  const getNodeName = useCallback(
    (value: unknown): string | undefined =>
      isESTreeNode(value) ? String(value.type) : undefined,
    [],
  );

  return (
    <ASTViewer
      filterProps={filterProps}
      getRange={getRange}
      getNodeName={getNodeName}
      {...props}
    />
  );
}
