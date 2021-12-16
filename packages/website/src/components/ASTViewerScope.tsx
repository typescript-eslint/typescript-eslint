import React, { useCallback } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps } from './ast/types';

import { isRecord } from './ast/utils';

export const propsToFilter = [
  'parent',
  'comments',
  'tokens',
  // 'block',
  'upper',
  '$id',
];

function isScopeNode(node: unknown): node is Record<string, unknown> & {
  constructor: { name: string };
} {
  return (
    isRecord(node) &&
    'constructor' in node &&
    node.constructor.name !== 'Object'
  );
}

function getNodeName(value: unknown): string | undefined {
  if (isScopeNode(value)) {
    const name = String(value.constructor.name).replace(/\$[0-9]+$/, '');
    if (value.$id) {
      return `${name}$${String(value.$id)}`;
    }
    return name;
  }
  return undefined;
}

export default function ASTViewerScope(props: ASTViewerBaseProps): JSX.Element {
  const filterProps = useCallback(
    (item: [string, unknown]): boolean =>
      !propsToFilter.includes(item[0]) &&
      !item[0].startsWith('_') &&
      item[1] !== undefined,
    [],
  );

  return (
    <ASTViewer
      filterProps={filterProps}
      getRange={(): undefined => undefined}
      getNodeName={getNodeName}
      {...props}
    />
  );
}
