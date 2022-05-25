import React, { useReducer, useState } from 'react';
import type Monaco from 'monaco-editor';
import clsx from 'clsx';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './Playground.module.css';
import Loader from './layout/Loader';

import useHashState from './hooks/useHashState';
import OptionsSelector from './OptionsSelector';
import { LoadingEditor } from './editor/LoadingEditor';
import { EditorEmbed } from './editor/EditorEmbed';
import { shallowEqual } from './lib/shallowEqual';

import ASTViewerESTree from './ASTViewerESTree';
import ASTViewerTS from './ASTViewerTS';

import type { RuleDetails, SelectedRange } from './types';

import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceFile } from 'typescript';
import ASTViewerScope from '@site/src/components/ASTViewerScope';

function rangeReducer<T extends SelectedRange | null>(
  prevState: T,
  action: T,
): T {
  if (prevState !== action) {
    if (
      !prevState ||
      !action ||
      !shallowEqual(prevState.start, action.start) ||
      !shallowEqual(prevState.end, action.end)
    ) {
      return action;
    }
  }
  return prevState;
}

function Playground(): JSX.Element {
  const [state, setState] = useHashState({
    jsx: false,
    showAST: false,
    sourceType: 'module',
    code: '',
    ts: process.env.TS_VERSION!,
    rules: {},
    tsConfig: {},
  });
  const { colorMode } = useColorMode();
  const [esAst, setEsAst] = useState<TSESTree.Program | string | null>();
  const [tsAst, setTsAST] = useState<SourceFile | string | null>();
  const [scope, setScope] = useState<Record<string, unknown> | string | null>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedRange, setSelectedRange] = useReducer(rangeReducer, null);
  const [position, setPosition] = useState<Monaco.Position | null>(null);

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
            darkTheme={colorMode === 'dark'}
            sourceType={state.sourceType}
            rules={state.rules}
            showAST={state.showAST}
            onEsASTChange={setEsAst}
            onTsASTChange={setTsAST}
            onScopeChange={setScope}
            decoration={selectedRange}
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
            {(tsAst && state.showAST === 'ts' && (
              <ASTViewerTS
                value={tsAst}
                position={position}
                onSelectNode={setSelectedRange}
              />
            )) ||
              (state.showAST === 'scope' && scope && (
                <ASTViewerScope
                  value={scope}
                  position={position}
                  onSelectNode={setSelectedRange}
                />
              )) ||
              (esAst && (
                <ASTViewerESTree
                  value={esAst}
                  position={position}
                  onSelectNode={setSelectedRange}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Playground;
