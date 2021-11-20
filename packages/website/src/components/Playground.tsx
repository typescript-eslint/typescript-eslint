import React, { useCallback, useState } from 'react';
import type Monaco from 'monaco-editor';
import useThemeContext from '@theme/hooks/useThemeContext';

import styles from './Playground.module.css';
import Loader from './layout/Loader';

import useHashState from './hooks/useHashState';
import OptionsSelector from './OptionsSelector';
import ASTViewer from './ast/ASTViewer';
import clsx from 'clsx';
import Editor from './editor/Editor';
import { findNode } from './lib/selection';
import type { RuleDetails } from './types';

import type {
  ParseForESLintResult,
  TSESTree,
} from '@typescript-eslint/website-eslint';

function Playground(): JSX.Element {
  const [state, setState] = useHashState({
    jsx: false,
    showAST: false,
    sourceType: 'module' as 'script' | 'module',
    code: '',
    ts: process.env.TS_VERSION,
    rules: {},
    tsConfig: {},
  });
  const { isDarkTheme } = useThemeContext();
  const [ast, setAST] = useState<ParseForESLintResult['ast'] | string | null>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
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
          isLoading={isLoading}
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
            tsConfig={state.tsConfig}
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
              setIsLoading(false);
              setState();
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
