import React, { useCallback, useReducer, useState } from 'react';
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

import type {
  RuleDetails,
  SelectedRange,
  ErrorItem,
  TabType,
  ConfigModel,
} from './types';

import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceFile } from 'typescript';
import ASTViewerScope from '@site/src/components/ASTViewerScope';
import ErrorsViewer from '@site/src/components/ErrorsViewer';
import EditorTabs from '@site/src/components/EditorTabs';
import ConfigEslint from '@site/src/components/config/ConfigEslint';
import ConfigTypeScript from '@site/src/components/config/ConfigTypeScript';
import {
  defaultEslintConfig,
  defaultTsConfig,
} from '@site/src/components/config/utils';

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
    tsconfig: defaultTsConfig,
    eslintrc: defaultEslintConfig,
  });
  const { colorMode } = useColorMode();
  const [esAst, setEsAst] = useState<TSESTree.Program | null>();
  const [tsAst, setTsAST] = useState<SourceFile | null>();
  const [scope, setScope] = useState<Record<string, unknown> | null>();
  const [markers, setMarkers] = useState<ErrorItem[]>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedRange, setSelectedRange] = useReducer(rangeReducer, null);
  const [position, setPosition] = useState<Monaco.Position | null>(null);
  const [activeTab, setTab] = useState<TabType>('code');
  const [showModal, setShowModal] = useState<TabType | false>(false);

  const updateModal = useCallback(
    (config?: Partial<ConfigModel>) => {
      if (config) {
        setState(config);
      }
      setShowModal(false);
    },
    [setState],
  );

  return (
    <div className={styles.codeContainer}>
      {ruleNames.length > 0 && (
        <ConfigEslint
          isOpen={showModal === 'eslintrc'}
          ruleOptions={ruleNames}
          config={state.eslintrc}
          onClose={updateModal}
        />
      )}
      <ConfigTypeScript
        isOpen={showModal === 'tsconfig'}
        config={state.tsconfig}
        onClose={updateModal}
      />
      <div className={clsx(styles.options, 'thin-scrollbar')}>
        <OptionsSelector
          isLoading={isLoading}
          state={state}
          tsVersions={tsVersions}
          setState={setState}
        />
      </div>
      <div className={styles.codeBlocks}>
        <div className={clsx(styles.sourceCode)}>
          {isLoading && <Loader />}
          <EditorTabs
            tabs={['code', 'tsconfig', 'eslintrc']}
            activeTab={activeTab}
            change={setTab}
            showModal={(): void => setShowModal(activeTab)}
          />
          <div className={styles.tabCode}>
            <EditorEmbed />
          </div>
          <LoadingEditor
            ts={state.ts}
            jsx={state.jsx}
            activeTab={activeTab}
            code={state.code}
            tsconfig={state.tsconfig}
            eslintrc={state.eslintrc}
            darkTheme={colorMode === 'dark'}
            sourceType={state.sourceType}
            showAST={state.showAST}
            onEsASTChange={setEsAst}
            onTsASTChange={setTsAST}
            onScopeChange={setScope}
            onMarkersChange={setMarkers}
            decoration={selectedRange}
            onChange={setState}
            onLoaded={(ruleNames, tsVersions): void => {
              setRuleNames(ruleNames);
              setTSVersion(tsVersions);
              setIsLoading(false);
            }}
            onSelect={setPosition}
          />
        </div>
        <div className={styles.astViewer}>
          {(state.showAST === 'ts' && tsAst && (
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
            (state.showAST === 'es' && esAst && (
              <ASTViewerESTree
                value={esAst}
                position={position}
                onSelectNode={setSelectedRange}
              />
            )) || <ErrorsViewer value={markers} />}
        </div>
      </div>
    </div>
  );
}

export default Playground;
