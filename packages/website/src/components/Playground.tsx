import { useWindowSize } from '@docusaurus/theme-common';
import type { TSESTree } from '@typescript-eslint/utils';
import clsx from 'clsx';
import type * as ESQuery from 'esquery';
import React, { useCallback, useState } from 'react';
import type { SourceFile } from 'typescript';

import ASTViewer from './ast/ASTViewer';
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
  const [esAst, setEsAst] = useState<TSESTree.Program | null>();
  const [tsAst, setTsAST] = useState<SourceFile | null>();
  const [scope, setScope] = useState<Record<string, unknown> | null>();
  const [markers, setMarkers] = useState<ErrorGroup[] | Error>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedRange, setSelectedRange] = useState<SelectedRange>();
  const [position, setPosition] = useState<number>();
  const [activeTab, setTab] = useState<TabType>('code');
  const [showModal, setShowModal] = useState<TabType | false>(false);
  const [esQueryFilter, setEsQueryFilter] = useState<ESQuery.Selector>();
  const [esQueryError, setEsQueryError] = useState<Error>();
  const windowSize = useWindowSize();

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

  const astToShow =
    state.showAST === 'ts'
      ? tsAst
      : state.showAST === 'scope'
      ? scope
      : state.showAST === 'es'
      ? esAst
      : undefined;

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
          render={windowSize !== 'mobile'}
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
            render={windowSize !== 'mobile'}
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
                jsx={state.jsx}
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
                selectedRange={selectedRange}
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

              {(state.showAST === 'es' && esQueryError && (
                <ErrorViewer
                  type="warning"
                  title="Invalid Selector"
                  value={esQueryError}
                />
              )) ||
                (state.showAST && astToShow && (
                  <ASTViewer
                    key={String(state.showAST)}
                    filter={state.showAST === 'es' ? esQueryFilter : undefined}
                    value={astToShow}
                    enableScrolling={true}
                    cursorPosition={position}
                    onHoverNode={setSelectedRange}
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
