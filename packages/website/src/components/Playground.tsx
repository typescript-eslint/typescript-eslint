import type { ImperativePanelHandle } from 'react-resizable-panels';

import { useWindowSize } from '@docusaurus/theme-common';
import clsx from 'clsx';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import type { UpdateModel } from './linter/types';
import type { ErrorGroup, RuleDetails, SelectedRange, TabType } from './types';

import ASTViewer from './ast/ASTViewer';
import ConfigEslint from './config/ConfigEslint';
import ConfigTypeScript from './config/ConfigTypeScript';
import { EditorEmbed } from './editor/EditorEmbed';
import { LoadingEditor } from './editor/LoadingEditor';
import { ErrorsViewer, ErrorViewer } from './ErrorsViewer';
import { ESQueryFilter } from './ESQueryFilter';
import { useHashState } from './hooks/useHashState';
import EditorTabs from './layout/EditorTabs';
import Loader from './layout/Loader';
import { defaultConfig, detailTabs } from './options';
import OptionsSelector from './OptionsSelector';
import styles from './Playground.module.css';
import { TypesDetails } from './typeDetails/TypesDetails';

function Playground(): React.JSX.Element {
  const windowSize = useWindowSize();
  const [state, setState] = useHashState(defaultConfig);
  const [astModel, setAstModel] = useState<UpdateModel>();
  const [markers, setMarkers] = useState<ErrorGroup[]>();
  const [ruleNames, setRuleNames] = useState<RuleDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tsVersions, setTSVersion] = useState<readonly string[]>([]);
  const [selectedRange, setSelectedRange] = useState<SelectedRange>();
  const [position, setPosition] = useState<number>();
  const [activeTab, setTab] = useState<TabType>('tsconfig');
  const [esQueryError, setEsQueryError] = useState<Error>();
  const [visualEslintRc, setVisualEslintRc] = useState(false);
  const [visualTSConfig, setVisualTSConfig] = useState(false);
  const playgroundMenuRef = useRef<ImperativePanelHandle>(null);
  const optionsSize = useMemo(
    () =>
      Math.round(
        (parseFloat(getComputedStyle(document.documentElement).fontSize) *
          2000) /
          innerWidth,
      ),
    [],
  );

  const onLoaded = useCallback(
    (ruleNames: RuleDetails[], tsVersions: readonly string[]) => {
      setRuleNames(ruleNames);
      setTSVersion(tsVersions);
      setIsLoading(false);
    },
    [],
  );

  console.log(markers);
  const ActiveVisualEditor =
    !isLoading &&
    {
      code: undefined,
      eslintrc: visualEslintRc && ConfigEslint,
      tsconfig: visualTSConfig && ConfigTypeScript,
    }[activeTab];

  const onVisualEditor = useCallback((tab: TabType) => {
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
        autoSaveId="playground-size"
        className={styles.panelGroup}
        direction={windowSize === 'mobile' ? 'vertical' : 'horizontal'}
      >
        <Panel
          className={styles.PanelColumn}
          collapsible={true}
          defaultSizePercentage={windowSize === 'mobile' ? 0 : optionsSize}
          id="playgroundMenu"
          ref={playgroundMenuRef}
        >
          <div className={styles.playgroundMenu}>
            <OptionsSelector
              setState={setState}
              state={state}
              tsVersions={tsVersions}
            />
          </div>
        </Panel>
        <PanelResizeHandle
          className={styles.PanelResizeHandle}
          style={windowSize === 'mobile' ? { display: 'none' } : {}}
        />
        <Panel
          className={styles.PanelColumn}
          collapsible={true}
          id="playgroundEditor"
        >
          {isLoading && <Loader />}
          <EditorTabs
            active={activeTab}
            change={setTab}
            showModal={onVisualEditor}
            showVisualEditor={activeTab !== 'code'}
            tabs={['code', 'tsconfig', 'eslintrc']}
          />
          {ActiveVisualEditor && (
            <ActiveVisualEditor
              className={styles.tabCode}
              config={state[activeTab]}
              onChange={setState}
              ruleOptions={ruleNames}
            />
          )}
          <div
            className={clsx(
              styles.tabCode,
              ActiveVisualEditor && styles.hidden,
            )}
            key="monacoEditor"
          >
            <EditorEmbed />
          </div>
          <LoadingEditor
            {...state}
            activeTab={activeTab}
            onASTChange={setAstModel}
            onChange={setState}
            onLoaded={onLoaded}
            onMarkersChange={setMarkers}
            onSelect={setPosition}
            selectedRange={selectedRange}
          />
        </Panel>
        <PanelResizeHandle className={styles.PanelResizeHandle} />
        <Panel
          className={styles.PanelColumn}
          collapsible={true}
          id="playgroundInfo"
        >
          <div>
            <EditorTabs
              active={state.showAST ?? false}
              additionalTabsInfo={{
                Errors:
                  markers?.reduce((prev, cur) => prev + cur.items.length, 0) ||
                  0,
              }}
              change={showAST => setState({ showAST })}
              tabs={detailTabs}
            />
            {state.showAST === 'es' && (
              <ESQueryFilter
                defaultValue={state.esQuery?.filter}
                onChange={(filter, selector) =>
                  setState({ esQuery: { filter, selector } })
                }
                onError={setEsQueryError}
              />
            )}
          </div>
          <div className={styles.playgroundInfoContainer}>
            {state.showAST === 'es' && esQueryError ? (
              <ErrorViewer
                title="Invalid Selector"
                type="warning"
                value={esQueryError}
              />
            ) : state.showAST && astModel ? (
              state.showAST === 'types' && astModel.storedTsAST ? (
                <TypesDetails
                  cursorPosition={position}
                  onHoverNode={setSelectedRange}
                  typeChecker={astModel.typeChecker}
                  value={astModel.storedTsAST}
                />
              ) : (
                <ASTViewer
                  cursorPosition={position}
                  enableScrolling={state.scroll}
                  filter={
                    state.showAST === 'es' ? state.esQuery?.selector : undefined
                  }
                  key={state.showAST}
                  onHoverNode={setSelectedRange}
                  showTokens={state.showTokens}
                  value={
                    state.showAST === 'types'
                      ? undefined
                      : astModel[
                          `stored${({ es: 'AST', scope: 'Scope', ts: 'TsAST' } as const)[state.showAST]}` as const
                        ]
                  }
                />
              )
            ) : (
              <ErrorsViewer value={markers} />
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Playground;
