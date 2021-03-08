import React, { useState } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import styles from './playground.module.css';
import Loader from './loader';

import useHashState from './lib/use-hash-state';

import type { ParseForESLintResult } from './linter/parser';
import type { TSESTree } from '@typescript-eslint/types';
import OptionsSelector from './options-selector';
import ASTViewer from './ast-viewer';
import clsx from 'clsx';
import Editor from './editor';

function Playground(): JSX.Element {
  const [state, setState] = useHashState({
    jsx: false,
    showAST: false,
    sourceType: 'module' as 'script' | 'module',
    code: '',
    rules: {} as Record<string, unknown>,
  });
  const { isDarkTheme } = useThemeContext();
  const [ast, setAST] = useState<ParseForESLintResult['ast'] | string | null>();
  const [ruleNames, setRuleNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<TSESTree.Node | null>(null);

  return (
    <div className={styles.codeContainer}>
      <div className={styles.options}>
        <OptionsSelector
          state={state}
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
            jsx={state.jsx}
            code={state.code}
            darkTheme={isDarkTheme}
            sourceType={state.sourceType}
            rules={state.rules}
            showAST={state.showAST}
            onLoadRule={setRuleNames}
            onASTChange={setAST}
            decoration={selectedNode}
            onChange={(code): void => setState('code', code)}
            onLoaded={(): void => setIsLoading(true)}
          />
        </div>
        {state.showAST && (
          <div className={styles.astViewer}>
            {ast && (
              <ASTViewer
                ast={ast}
                onSelectNode={(node): void => setSelectedNode(node)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Playground;
