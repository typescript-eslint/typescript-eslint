import { useWindowSize } from '@docusaurus/theme-common';
import type * as ESQuery from 'esquery';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import ASTViewer from './ast/ASTViewer';
import ConfigEslint from './config/ConfigEslint';
import ConfigTypeScript from './config/ConfigTypeScript';
import LoadingEditor from './editor/LoadingEditor';
import { ErrorsViewer } from './ErrorsViewer';
import { ESQueryFilter } from './ESQueryFilter';
import useHashState from './hooks/useHashState';
import EditorTabs from './layout/EditorTabs';
import { createFileSystem } from './linter/bridge';
import type { PlaygroundSystem, UpdateModel } from './linter/types';
import { defaultConfig, detailTabs } from './options';
import OptionsSelector from './OptionsSelector';
import styles from './Playground.module.css';
import { TypesDetails } from './typeDetails/TypesDetails';
import type { ErrorGroup } from './types';

function Playground(): JSX.Element {
  const [state, setState] = useHashState(defaultConfig);

  const [system] = useState<PlaygroundSystem>(() => createFileSystem(state));
  const [activeFile, setFileName] = useState(`input${state.fileType}`);
  const [editorFile, setEditorFile] = useState(`input${state.fileType}`);
  const [visualEslintRc, setVisualEslintRc] = useState(false);
  const [visualTSConfig, setVisualTSConfig] = useState(false);
  const [errors, setErrors] = useState<ErrorGroup[]>([]);
  const [astModel, setAstModel] = useState<UpdateModel>();
  const [esQueryFilter, setEsQueryFilter] = useState<ESQuery.Selector>();
  const [selectedRange, setSelectedRange] = useState<[number, number]>();
  const [cursorPosition, onCursorChange] = useState<number>();
  const playgroundMenuRef = useRef<ImperativePanelHandle>(null);

  const windowSize = useWindowSize();

  const activeVisualEditor =
    visualEslintRc && activeFile === '.eslintrc'
      ? 'eslintrc'
      : visualTSConfig && activeFile === 'tsconfig.json'
      ? 'tsconfig'
      : undefined;

  const onVisualEditor = useCallback((tab: string): void => {
    if (tab === 'tsconfig.json') {
      setVisualTSConfig(val => !val);
    } else if (tab === '.eslintrc') {
      setVisualEslintRc(val => !val);
    }
  }, []);

  useEffect(() => {
    const closeable = [
      system.watchFile('/input.*', fileName => {
        setState({ code: system.readFile(fileName) });
      }),
      system.watchFile('/.eslintrc', fileName => {
        setState({ eslintrc: system.readFile(fileName) });
      }),
      system.watchFile('/tsconfig.json', fileName => {
        setState({ tsconfig: system.readFile(fileName) });
      }),
    ];
    return () => {
      closeable.forEach(d => d.close());
    };
  }, [setState, system]);

  useEffect(() => {
    const newFile = `input${state.fileType}`;
    if (newFile !== editorFile) {
      if (editorFile === activeFile) {
        setFileName(newFile);
      }
      setEditorFile(newFile);
    }
  }, [state, system, editorFile, activeFile]);

  useEffect(() => {
    if (windowSize === 'mobile') {
      playgroundMenuRef.current?.collapse();
    } else if (windowSize === 'desktop') {
      playgroundMenuRef.current?.expand();
    }
  }, [windowSize, playgroundMenuRef]);

  return (
    <>
      <PanelGroup
        className={styles.panelGroup}
        autoSaveId="playground-resize"
        direction={windowSize === 'mobile' ? 'vertical' : 'horizontal'}
      >
        <Panel
          id="playgroundMenu"
          className={styles.PanelRow}
          defaultSize={20}
          minSize={10}
          collapsible={true}
          ref={playgroundMenuRef}
        >
          <OptionsSelector state={state} setState={setState} />
        </Panel>
        <PanelResizeHandle
          className={styles.PanelResizeHandle}
          style={windowSize === 'mobile' ? { display: 'none' } : {}}
        />
        <Panel
          id="playgroundEditor"
          className={styles.PanelRow}
          collapsible={true}
        >
          <div className={styles.playgroundEditor}>
            <EditorTabs
              tabs={[editorFile, '.eslintrc', 'tsconfig.json']}
              active={activeFile}
              change={setFileName}
              showModal={onVisualEditor}
              showVisualEditor={activeFile !== editorFile}
            />
            {(activeVisualEditor === 'eslintrc' && (
              <ConfigEslint className={styles.tabCode} system={system} />
            )) ||
              (activeVisualEditor === 'tsconfig' && (
                <ConfigTypeScript className={styles.tabCode} system={system} />
              ))}
            <LoadingEditor
              className={activeVisualEditor ? styles.hidden : ''}
              tsVersion={state.ts}
              onUpdate={setAstModel}
              system={system}
              activeFile={activeFile}
              onValidate={setErrors}
              onCursorChange={onCursorChange}
              selectedRange={selectedRange}
            />
          </div>
        </Panel>
        <PanelResizeHandle className={styles.PanelResizeHandle} />
        <Panel
          id="playgroundInfo"
          className={styles.PanelRow}
          defaultSize={50}
          collapsible={true}
        >
          <div className={styles.playgroundInfoContainer}>
            <div className={styles.playgroundInfoHeader}>
              <EditorTabs
                tabs={detailTabs}
                active={state.showAST ?? false}
                change={(v): void => setState({ showAST: v })}
              />
              {state.showAST === 'es' && (
                <ESQueryFilter onChange={setEsQueryFilter} />
              )}
            </div>
            <div className={styles.playgroundInfo}>
              {!state.showAST || !astModel ? (
                <ErrorsViewer value={errors} />
              ) : state.showAST === 'types' && astModel.storedTsAST ? (
                <TypesDetails
                  typeChecker={astModel.typeChecker}
                  value={astModel.storedTsAST}
                  onHoverNode={setSelectedRange}
                  cursorPosition={cursorPosition}
                />
              ) : (
                <ASTViewer
                  key={state.showAST}
                  filter={state.showAST === 'es' ? esQueryFilter : undefined}
                  value={
                    state.showAST === 'ts'
                      ? astModel.storedTsAST
                      : state.showAST === 'scope'
                      ? astModel.storedScope
                      : astModel.storedAST
                  }
                  showTokens={state.showTokens}
                  enableScrolling={state.scroll}
                  cursorPosition={cursorPosition}
                  onHoverNode={setSelectedRange}
                />
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </>
  );
}

export default Playground;
