import type { TSESTree } from '@typescript-eslint/utils';
import React, { useMemo } from 'react';

import ASTViewer from './ast/ASTViewer';
import { serialize } from './ast/serializer/serializer';
import { createESTreeSerializer } from './ast/serializer/serializerESTree';
import type { ASTViewerBaseProps } from './ast/types';
import Text from './inputs/Text';
import styles from './ASTViewerESTree.module.css';

export interface ASTESTreeViewerProps extends ASTViewerBaseProps {
  readonly value: TSESTree.BaseNode;
  readonly filter: string;
  readonly onChangeFilter: (filter: string) => void;
}

export default function ASTViewerESTree({
  value,
  position,
  onSelectNode,
  filter,
  onChangeFilter,
}: ASTESTreeViewerProps): JSX.Element {
  const model = useMemo(() => {
    if (window.esquery && filter.length > 0) {
      try {
        const queryParsed = window.esquery.parse(filter);
        const match = window.esquery.match(value, queryParsed);
        return serialize(match, createESTreeSerializer());
      } catch (e: unknown) {
        if (e instanceof Error) {
          return e;
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
          onChange={onChangeFilter}
          className={styles.search}
          placeholder="ESQuery filter"
        />
      </div>
      <>
        {model instanceof Error ? (
          <div className={styles.errorContainer}>
            <div className="admonition alert alert--danger">
              <div className="admonition-content">
                <div>{model.message}</div>
              </div>
            </div>
          </div>
        ) : (
          <ASTViewer
            value={model}
            position={position}
            onSelectNode={onSelectNode}
          />
        )}
      </>
    </>
  );
}
