import React, { useCallback, useState } from 'react';
import type Monaco from 'monaco-editor';
import clsx from 'clsx';
import useThemeContext from '@theme/hooks/useThemeContext';

import styles from './Playground.module.css';
import Loader from './layout/Loader';

import useHashState from './hooks/useHashState';
import OptionsSelector from './OptionsSelector';
import ASTViewer from './ast/ASTViewer';
import { LoadingEditor } from './editor/LoadingEditor';
import { EditorEmbed } from './editor/EditorEmbed';
import type { RuleDetails } from './types';

import type { TSESTree } from '@typescript-eslint/website-eslint';

function Playground(): JSX.Element {
  const [state, setState] = useHashState({
    jsx: false,
    showAST: false,
    sourceType: 'module',
    code: '',
    ts: process.env.TS_VERSION,
    rules: {},
    tsConfig: {},
  });
  const { isDarkTheme } = useThemeContext();
  const [ast, setAST] = useState<TSESTree.Program | string | null>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedNode, setSelectedNode] = useState<TSESTree.Node | null>(null);
  const [position, setPosition] = useState<Monaco.Position | null>(null);

  const updateSelectedNode = useCallback(
    (node: TSESTree.Node | null) => {
      if (
        !node ||
        !selectedNode ||
        selectedNode.range[0] !== node.range[0] ||
        selectedNode.range[1] !== node.range[1]
      ) {
        setSelectedNode(node);
      }
    },
    [selectedNode],
  );

  return (
    <div className={styles.codeContainer}>
      <div className={clsx(styles.options, 'thin-scrollbar')}>
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
          <EditorEmbed />
          <LoadingEditor
            ts={state.ts}
            jsx={state.jsx}
            code={state.code}
            tsConfig={state.tsConfig}
            darkTheme={isDarkTheme}
            sourceType={state.sourceType}
            rules={state.rules}
            showAST={state.showAST}
            onASTChange={setAST}
            decoration={selectedNode}
            onChange={(code): void => setState({ code: code })}
            onLoaded={(ruleNames, tsVersions): void => {
              setRuleNames(ruleNames);
              setTSVersion(tsVersions);
              setIsLoading(false);
            }}
            onSelect={setPosition}
          />
        </div>
        {state.showAST && (
          <div className={styles.astViewer}>
            {ast && (
              <ASTViewer
                ast={ast}
                position={position}
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
