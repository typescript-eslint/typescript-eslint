import type { TSESTree } from '@typescript-eslint/utils';
import clsx from 'clsx';
import type * as ESQuery from 'esquery';
import type Monaco from 'monaco-editor';
import React, { useCallback, useReducer, useState } from 'react';
import type { SourceFile } from 'typescript';

import { useMediaQuery } from '../hooks/useMediaQuery';
import ASTViewerESTree from './ASTViewerESTree';
import ASTViewerScope from './ASTViewerScope';
import ASTViewerTS from './ASTViewerTS';
import { detailTabs } from './config';
import ConfigEslint from './config/ConfigEslint';
import ConfigTypeScript from './config/ConfigTypeScript';
import { defaultEslintConfig, defaultTsConfig } from './config/utils';
import { EditorEmbed } from './editor/EditorEmbed';
import { LoadingEditor } from './editor/LoadingEditor';
import { ErrorsViewer, ErrorViewer } from './ErrorsViewer';
import { ESQueryFilter } from './ESQueryFilter';
import useHashState from './hooks/useHashState';
import EditorTabs from './layout/EditorTabs';
import Loader from './layout/Loader';
import { shallowEqual } from './lib/shallowEqual';
import OptionsSelector from './OptionsSelector';
import styles from './Playground.module.css';
import ConditionalSplitPane from './SplitPane/ConditionalSplitPane';
import type {
  ConfigModel,
  ErrorGroup,
  RuleDetails,
  SelectedRange,
  TabType,
} from './types';

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
    fileType: 'tsx',
    showAST: false,
    sourceType: 'module',
    code: '',
    ts: process.env.TS_VERSION!,
    tsconfig: defaultTsConfig,
    eslintrc: defaultEslintConfig,
  });
  const [esAst, setEsAst] = useState<TSESTree.Program | null>();
  const [tsAst, setTsAST] = useState<SourceFile | null>();
  const [scope, setScope] = useState<Record<string, unknown> | null>();
  const [markers, setMarkers] = useState<ErrorGroup[] | Error>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedRange, setSelectedRange] = useReducer(rangeReducer, null);
  const [position, setPosition] = useState<Monaco.Position | null>(null);
  const [activeTab, setTab] = useState<TabType>('code');
  const [showModal, setShowModal] = useState<TabType | false>(false);
  const [esQueryFilter, setEsQueryFilter] = useState<ESQuery.Selector>();
  const [esQueryError, setEsQueryError] = useState<Error>();
  const enableSplitPanes = useMediaQuery('(min-width: 996px)');

  const updateModal = useCallback(
    (config?: Partial<ConfigModel>) => {
      if (config) {
        setState(config);
      }
      setShowModal(false);
    },
    [setState],
  );

  const onLoaded = useCallback(
    (ruleNames: RuleDetails[], tsVersions: readonly string[]): void => {
      setRuleNames(ruleNames);
      setTSVersion(tsVersions);
      setIsLoading(false);
    },
    [],
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
      <div className={styles.codeBlocks}>
        <ConditionalSplitPane
          render={enableSplitPanes}
          split="vertical"
          minSize="10%"
          defaultSize="20rem"
          maxSize={
            20 * parseFloat(getComputedStyle(document.documentElement).fontSize)
          }
        >
          <div className={clsx(styles.options, 'thin-scrollbar')}>
            <OptionsSelector
              isLoading={isLoading}
              state={state}
              tsVersions={tsVersions}
              setState={setState}
            />
          </div>
          <ConditionalSplitPane
            render={enableSplitPanes}
            split="vertical"
            minSize="10%"
            defaultSize="50%"
            pane2Style={{ overflow: 'hidden' }}
          >
            <div className={clsx(styles.sourceCode)}>
              {isLoading && <Loader />}
              <EditorTabs
                tabs={['code', 'tsconfig', 'eslintrc']}
                active={activeTab}
                change={setTab}
                showVisualEditor={activeTab !== 'code'}
                showModal={(): void => setShowModal(activeTab)}
              />
              <div className={styles.tabCode}>
                <EditorEmbed />
              </div>
              <LoadingEditor
                ts={state.ts}
                fileType={state.fileType}
                activeTab={activeTab}
                code={state.code}
                tsconfig={state.tsconfig}
                eslintrc={state.eslintrc}
                sourceType={state.sourceType}
                showAST={state.showAST}
                onEsASTChange={setEsAst}
                onTsASTChange={setTsAST}
                onScopeChange={setScope}
                onMarkersChange={setMarkers}
                decoration={selectedRange}
                onChange={setState}
                onLoaded={onLoaded}
                onSelect={setPosition}
              />
            </div>
            <div className={styles.astViewer}>
              <div className={styles.playgroundInfoHeader}>
                <EditorTabs
                  tabs={detailTabs}
                  active={state.showAST ?? false}
                  change={(v): void => setState({ showAST: v })}
                />
                {state.showAST === 'es' && (
                  <ESQueryFilter
                    onChange={setEsQueryFilter}
                    onError={setEsQueryError}
                  />
                )}
              </div>

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
                (state.showAST === 'es' && esQueryError && (
                  <ErrorViewer
                    type="warning"
                    title="Invalid Selector"
                    value={esQueryError}
                  />
                )) ||
                (state.showAST === 'es' && esAst && (
                  <ASTViewerESTree
                    value={esAst}
                    position={position}
                    filter={esQueryFilter}
                    onSelectNode={setSelectedRange}
                  />
                )) || <ErrorsViewer value={markers} />}
            </div>
          </ConditionalSplitPane>
        </ConditionalSplitPane>
      </div>
    </div>
  );
}

export default Playground;
