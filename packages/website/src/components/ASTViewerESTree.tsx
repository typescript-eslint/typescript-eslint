import type { TSESTree } from '@typescript-eslint/utils';
import type * as ESQuery from 'esquery';
import React, { useMemo } from 'react';

import ASTViewer from './ast/ASTViewer';
import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';
import type { ASTViewerBaseProps } from './ast/types';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode;
  readonly filter?: ESQuery.Selector;
}

function tryToApplyFilter<T extends TSESTree.BaseNode>(
  value: T,
  filter?: ESQuery.Selector,
): T | T[] {
  try {
    if (window.esquery && filter) {
      // @ts-expect-error - esquery requires js ast types
      return window.esquery.match(value, filter);
    }
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return value;
}

export default function ASTViewerESTree({
  value,
  position,
  onSelectNode,
  filter,
}: ASTESTreeViewerProps): JSX.Element {
  const model = useMemo(() => {
    return serialize(tryToApplyFilter(value, filter), createESTreeSerializer());
  }, [value, filter]);

  return (
    <ASTViewer value={model} position={position} onSelectNode={onSelectNode} />
  );
}
