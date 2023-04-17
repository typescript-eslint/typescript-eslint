import type * as ESQuery from 'esquery';
import React, { useEffect, useMemo } from 'react';

import CopyButton from '../inputs/CopyButton';
import { debounce } from '../lib/debounce';
import { scrollIntoViewIfNeeded } from '../lib/scroll-into';
import styles from './ASTViewer.module.css';
import DataRender from './DataRenderer';
import { findSelectionPath } from './selectedRange';
import type { OnHoverNodeFn } from './types';

export interface ASTViewerProps {
  readonly cursorPosition?: number;
  readonly onHoverNode?: OnHoverNodeFn;
  readonly value: unknown;
  readonly filter?: ESQuery.Selector;
  readonly enableScrolling?: boolean;
  readonly hideCopyButton?: boolean;
  readonly showTokens?: boolean;
}

function tryToApplyFilter<T>(value: T, filter?: ESQuery.Selector): T | T[] {
  try {
    if (window.esquery && filter) {
      // @ts-expect-error - esquery requires js ast types
      return window.esquery.match(value, filter);
    }
  } catch (e: unknown) {
    console.error(e);
  }
  return value;
}

function ASTViewer({
  cursorPosition,
  onHoverNode,
  value,
  filter,
  enableScrolling,
  hideCopyButton,
  showTokens,
}: ASTViewerProps): JSX.Element {
  const model = useMemo(() => {
    if (filter) {
      return tryToApplyFilter(value, filter);
    }
    return value;
  }, [value, filter]);

  const selectedPath = useMemo(() => {
    if (cursorPosition == null || !model || typeof model !== 'object') {
      return 'ast';
    }
    return findSelectionPath(model, cursorPosition).path.join('.');
  }, [cursorPosition, model]);

  useEffect(() => {
    if (enableScrolling) {
      const delayed = debounce(() => {
        const htmlElement = document.querySelector(
          `div[data-level="${selectedPath}"] > a`,
        );
        if (htmlElement) {
          scrollIntoViewIfNeeded(htmlElement);
        }
      }, 100);
      delayed();
    }
  }, [selectedPath, enableScrolling]);

  return (
    <div className={styles.list}>
      <DataRender
        level="ast"
        value={model}
        lastElement={true}
        selectedPath={selectedPath}
        onHover={onHoverNode}
        showTokens={showTokens}
      />
      {!hideCopyButton && <CopyButton value={model} />}
    </div>
  );
}

export default ASTViewer;
