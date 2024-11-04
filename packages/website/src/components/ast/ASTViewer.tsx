import type * as ESQuery from 'esquery';

import React, { useEffect, useMemo } from 'react';

import type { OnHoverNodeFn } from './types';

import CopyButton from '../inputs/CopyButton';
import { debounce } from '../lib/debounce';
import { scrollIntoViewIfNeeded } from '../lib/scroll-into';
import styles from './ASTViewer.module.css';
import DataRender from './DataRenderer';
import { findSelectionPath } from './selectedRange';

export interface ASTViewerProps {
  readonly cursorPosition?: number;
  readonly enableScrolling?: boolean;
  readonly filter?: ESQuery.Selector;
  readonly hideCopyButton?: boolean;
  readonly onHoverNode?: OnHoverNodeFn;
  readonly showTokens?: boolean;
  readonly value: unknown;
}

function tryToApplyFilter<T>(value: T, filter?: ESQuery.Selector): T | T[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.esquery && filter) {
      // @ts-expect-error - esquery requires js ast types
      return window.esquery.match(value, filter, {
        visitorKeys: window.visitorKeys,
      });
    }
  } catch (e: unknown) {
    console.error(e);
  }
  return value;
}

function ASTViewer({
  cursorPosition,
  enableScrolling,
  filter,
  hideCopyButton,
  onHoverNode,
  showTokens,
  value,
}: ASTViewerProps): React.JSX.Element {
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
        lastElement={true}
        level="ast"
        onHover={onHoverNode}
        selectedPath={selectedPath}
        showTokens={showTokens}
        value={model}
      />
      {!hideCopyButton && <CopyButton value={model} />}
    </div>
  );
}

export default ASTViewer;
