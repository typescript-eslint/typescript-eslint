import React, { useCallback, useState } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import styles from './playground.module.css';
import Loader from './loader';

import useHashState from './lib/use-hash-state';

import type { ParseForESLintResult } from './linter/parser';
import type { TSESTree } from '@typescript-eslint/types';
import type Monaco from 'monaco-editor';
import OptionsSelector from './options-selector';
import ASTViewer from './ast-viewer';
import clsx from 'clsx';
import Editor from './editor';
import { findNode } from './lib/selection';

function Playground(): JSX.Element {
  const [state, setState] = useHashState({
    jsx: false,
    showAST: false,
    sourceType: 'module' as 'script' | 'module',
    code: '',
    ts: process.env.TS_VERSION,
    rules: {},
  });
  const { isDarkTheme } = useThemeContext();
  const [ast, setAST] = useState<ParseForESLintResult['ast'] | string | null>();
  const [ruleNames, setRuleNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedNode, setSelectedNode] = useState<TSESTree.Node | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<TSESTree.Node | null>(
    null,
  );

  const updatePosition = useCallback(
    (position: Monaco.Position | null) => {
      if (typeof ast === 'object' && ast && position) {
        setHighlightedNode(
          findNode(
            {
              line: position.lineNumber,
              column: position.column - 1,
            },
            ast,
          ),
        );
      }
    },
    [ast],
  );

  const updateSelectedNode = useCallback(
    (node: TSESTree.Node | null) => {
      if (
        selectedNode !== node &&
        (!node ||
          !selectedNode ||
          selectedNode.range[0] !== node.range[0] ||
          selectedNode.range[1] !== node.range[1])
      ) {
        setSelectedNode(node);
      }
    },
    [selectedNode],
  );

  const updateAST = useCallback(
    (value: string | TSESTree.Program, position: Monaco.Position | null) => {
      if (typeof value === 'object' && value) {
        setAST(value);
        if (position) {
          setHighlightedNode(
            findNode(
              {
                line: position.lineNumber,
                column: position.column - 1,
              },
              value,
            ),
          );
        }
      }
    },
    [],
  );

  return (
    <div className={styles.codeContainer}>
      <div className={styles.options}>
        <OptionsSelector
          state={state}
          tsVersions={tsVersions}
          setState={setState}
          ruleOptions={ruleNames}
        />
      </div>
      <div className={styles.codeBlocks}>
        <div
          className={clsx(
            styles.sourceCode,
            state.showAST ? '' : styles.sourceCodeStandalone,
          )}
        >
          {isLoading && <Loader />}
          <Editor
            ts={state.ts}
            jsx={state.jsx}
            code={state.code}
            darkTheme={isDarkTheme}
            sourceType={state.sourceType}
            rules={state.rules}
            showAST={state.showAST}
            onLoadRule={setRuleNames}
            onASTChange={updateAST}
            decoration={selectedNode}
            onChange={(code): void => setState('code', code)}
            onLoaded={(tsVersions): void => {
              setTSVersion(tsVersions);
              setIsLoading(true);
            }}
            onSelect={updatePosition}
          />
        </div>
        {state.showAST && (
          <div className={styles.astViewer}>
            {ast && (
              <ASTViewer
                ast={ast}
                selection={highlightedNode}
                onSelectNode={updateSelectedNode}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Playground;
