// See https://github.com/typescript-eslint/typescript-eslint/issues/7630.
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useWindowSize } from '@docusaurus/theme-common';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import ASTViewer from './ast/ASTViewer';
import ConfigEslint from './config/ConfigEslint';
import ConfigTypeScript from './config/ConfigTypeScript';
import { EditorEmbed } from './editor/EditorEmbed';
import { LoadingEditor } from './editor/LoadingEditor';
import { ErrorsViewer, ErrorViewer } from './ErrorsViewer';
import { ESQueryFilter } from './ESQueryFilter';
import useHashState from './hooks/useHashState';
import EditorTabs from './layout/EditorTabs';
import Loader from './layout/Loader';
import type { UpdateModel } from './linter/types';
import { defaultConfig, detailTabs } from './options';
import OptionsSelector from './OptionsSelector';
import styles from './Playground.module.css';
import { TypesDetails } from './typeDetails/TypesDetails';
import type { ErrorGroup, RuleDetails, SelectedRange, TabType } from './types';

function Playground(): React.JSX.Element {
  const windowSize = useWindowSize();
  const [state, setState] = useHashState(defaultConfig);
  const [astModel, setAstModel] = useState<UpdateModel>();
  const [markers, setMarkers] = useState<ErrorGroup[]>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedRange, setSelectedRange] = useState<SelectedRange>();
  const [position, setPosition] = useState<number>();
  const [activeTab, setTab] = useState<TabType>('code');
  const [esQueryError, setEsQueryError] = useState<Error>();
  const [visualEslintRc, setVisualEslintRc] = useState(false);
  const [visualTSConfig, setVisualTSConfig] = useState(false);
  const playgroundMenuRef = useRef<ImperativePanelHandle>(null);
  const [optionsSize] = useState(() => {
    return Math.round(
      (parseFloat(getComputedStyle(document.documentElement).fontSize) * 2000) /
        window.innerWidth,
    );
  });

  const onLoaded = useCallback(
    (ruleNames: RuleDetails[], tsVersions: readonly string[]): void => {
      setRuleNames(ruleNames);
      setTSVersion(tsVersions);
      setIsLoading(false);
    },
    [],
  );

  const activeVisualEditor = !isLoading
    ? visualEslintRc && activeTab === 'eslintrc'
      ? 'eslintrc'
      : visualTSConfig && activeTab === 'tsconfig'
        ? 'tsconfig'
        : undefined
    : undefined;

  const onVisualEditor = useCallback((tab: TabType): void => {
    if (tab === 'tsconfig') {
      setVisualTSConfig(val => !val);
    } else if (tab === 'eslintrc') {
      setVisualEslintRc(val => !val);
    }
  }, []);

  useEffect(() => {
    if (windowSize === 'mobile') {
      playgroundMenuRef.current?.collapse();
    } else if (windowSize === 'desktop') {
      playgroundMenuRef.current?.expand();
    }
  }, [windowSize]);

  return (
    <div className={styles.codeContainer}>
      <PanelGroup
        className={styles.panelGroup}
        autoSaveId="playground-size"
        direction={windowSize === 'mobile' ? 'vertical' : 'horizontal'}
      >
        <Panel
          id="playgroundMenu"
          className={styles.PanelColumn}
          defaultSizePercentage={windowSize === 'mobile' ? 0 : optionsSize}
          collapsible={true}
          ref={playgroundMenuRef}
        >
          <div className={styles.playgroundMenu}>
            <OptionsSelector
              state={state}
              tsVersions={tsVersions}
              setState={setState}
            />
          </div>
        </Panel>
        <PanelResizeHandle
          className={styles.PanelResizeHandle}
          style={windowSize === 'mobile' ? { display: 'none' } : {}}
        />
        <Panel
          id="playgroundEditor"
          className={styles.PanelColumn}
          collapsible={true}
        >
          {isLoading && <Loader />}
          <EditorTabs
            tabs={['code', 'tsconfig', 'eslintrc']}
            active={activeTab}
            change={setTab}
            showVisualEditor={activeTab !== 'code'}
            showModal={onVisualEditor}
          />
          {(activeVisualEditor === 'eslintrc' && (
            <ConfigEslint
              className={styles.tabCode}
              ruleOptions={ruleNames}
              config={state.eslintrc}
              onChange={setState}
            />
          )) ||
            (activeVisualEditor === 'tsconfig' && (
              <ConfigTypeScript
                className={styles.tabCode}
                config={state.tsconfig}
                onChange={setState}
              />
            ))}
          <div
            key="monacoEditor"
            className={clsx(
              styles.tabCode,
              !!activeVisualEditor && styles.hidden,
            )}
          >
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
            onASTChange={setAstModel}
            onMarkersChange={setMarkers}
            selectedRange={selectedRange}
            onChange={setState}
            onLoaded={onLoaded}
            onSelect={setPosition}
          />
        </Panel>
        <PanelResizeHandle className={styles.PanelResizeHandle} />
        <Panel
          id="playgroundInfo"
          className={styles.PanelColumn}
          collapsible={true}
        >
          <div>
            <EditorTabs
              tabs={detailTabs}
              active={state.showAST ?? false}
              change={(v): void => setState({ showAST: v })}
              additionalTabsInfo={{
                Errors:
                  markers?.reduce((prev, cur) => prev + cur.items.length, 0) ||
                  0,
              }}
            />
            {state.showAST === 'es' && (
              <ESQueryFilter
                defaultValue={state.esQuery?.filter}
                onChange={(filter, selector) =>
                  setState({
                    esQuery: { filter, selector },
                  })
                }
                onError={setEsQueryError}
              />
            )}
          </div>
          <div className={styles.playgroundInfoContainer}>
            {(state.showAST === 'es' && esQueryError && (
              <ErrorViewer
                type="warning"
                title="Invalid Selector"
                value={esQueryError}
              />
            )) ||
              (state.showAST === 'types' && astModel?.storedTsAST && (
                <TypesDetails
                  typeChecker={astModel.typeChecker}
                  value={astModel.storedTsAST}
                  onHoverNode={setSelectedRange}
                  cursorPosition={position}
                />
              )) ||
              (state.showAST && astModel && (
                <ASTViewer
                  key={String(state.showAST)}
                  filter={
                    state.showAST === 'es' ? state.esQuery?.selector : undefined
                  }
                  value={
                    state.showAST === 'ts'
                      ? astModel.storedTsAST
                      : state.showAST === 'scope'
                        ? astModel.storedScope
                        : state.showAST === 'es'
                          ? astModel.storedAST
                          : undefined
                  }
                  showTokens={state.showTokens}
                  enableScrolling={state.scroll}
                  cursorPosition={position}
                  onHoverNode={setSelectedRange}
                />
              )) || <ErrorsViewer value={markers} />}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Playground;
