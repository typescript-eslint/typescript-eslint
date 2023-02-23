import type { TSESTree } from '@typescript-eslint/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';
import type { ASTViewerBaseProps } from './ast/types';
import Text from './inputs/Text';
import styles from './ASTViewerESTree.module.css';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode;
}

export default function ASTViewerESTree({
  value,
  position,
  onSelectNode,
}: ASTESTreeViewerProps): JSX.Element {
  const [filter, setFilter] = useState<string>('');
  const model = useMemo(() => {
    if (window.esquery && filter.length > 0) {
      try {
        const queryParsed = window.esquery.parse(filter);
        const match = window.esquery.match(value, queryParsed);
        return serialize(match, createESTreeSerializer());
      } catch (e: unknown) {
        if (e instanceof Error) {
          return e.message;
        }
        return String(e);
      }
    } else {
      return serialize(value, createESTreeSerializer());
    }
  }, [value, filter]);

  return (
    <>
      <div className={styles.searchContainer}>
        <Text
          value={filter}
          name="esquery"
          onChange={setFilter}
          className={styles.search}
        />
      </div>
      <ASTViewer
        value={model}
        position={position}
        onSelectNode={onSelectNode}
      />
    </>
  );
}
