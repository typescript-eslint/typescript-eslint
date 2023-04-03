import { useColorMode } from '@docusaurus/theme-common';
import type * as MonacoEditor from 'monaco-editor';
import { useEffect, useState } from 'react';

import type { createTypeScriptSandbox } from '../../vendor/sandbox';
import { createCompilerOptions } from '../lib/createCompilerOptions';
import { createFileSystem } from '../linter/bridge';
import type { PlaygroundSystem } from '../linter/types';
import { WebLinter } from '../linter/WebLinter';
import type { RuleDetails } from '../types';
import { editorEmbedId } from './EditorEmbed';
import { sandboxSingleton } from './loadSandbox';
import type { CommonEditorProps } from './types';

export interface SandboxServicesProps {
  readonly onLoaded: (
    ruleDetails: RuleDetails[],
    tsVersions: readonly string[],
  ) => void;
  readonly ts: string;
}

export type SandboxInstance = ReturnType<typeof createTypeScriptSandbox>;

export interface SandboxServices {
  sandboxInstance: SandboxInstance;
  system: PlaygroundSystem;
  webLinter: WebLinter;
}

export const useSandboxServices = (
  props: CommonEditorProps & SandboxServicesProps,
): Error | SandboxServices | undefined => {
  const { onLoaded } = props;
  const [services, setServices] = useState<Error | SandboxServices>();
  const { colorMode } = useColorMode();

  useEffect(() => {
    let sandboxInstance: SandboxInstance | undefined;

    sandboxSingleton(props.ts)
      .then(async ({ main, sandboxFactory, lintUtils }) => {
        const compilerOptions =
          createCompilerOptions() as MonacoEditor.languages.typescript.CompilerOptions;

        sandboxInstance = sandboxFactory.createTypeScriptSandbox(
          {
            text: props.code,
            monacoSettings: {
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'off',
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              autoIndent: 'full',
              formatOnPaste: true,
              formatOnType: true,
              wrappingIndent: 'same',
              hover: { above: false },
            },
            acquireTypes: false,
            compilerOptions: compilerOptions,
            domID: editorEmbedId,
          },
          main,
          window.ts,
        );
        sandboxInstance.monaco.editor.setTheme(
          colorMode === 'dark' ? 'vs-dark' : 'vs-light',
        );

        const system = createFileSystem(props, sandboxInstance.tsvfs);

        const worker = await sandboxInstance.getWorkerProcess();
        if (worker.getLibFiles) {
          const libs = await worker.getLibFiles();
          for (const [key, value] of Object.entries(libs)) {
            system.writeFile('/' + key, value);
          }
        }

        window.system = system;
        window.esquery = lintUtils.esquery;

        const webLinter = new WebLinter(
          system,
          lintUtils,
          sandboxInstance.tsvfs,
        );

        onLoaded(
          Array.from(webLinter.rules.values()),
          Array.from(
            new Set([...sandboxInstance.supportedVersions, window.ts.version]),
          )
            .filter(item => parseFloat(item) >= 4.2)
            .sort((a, b) => b.localeCompare(a)),
        );

        setServices({
          system,
          webLinter,
          sandboxInstance,
        });
      })
      .catch(setServices);

    return (): void => {
      if (!sandboxInstance) {
        return;
      }

      const editorModel = sandboxInstance.editor.getModel()!;
      sandboxInstance.monaco.editor.setModelMarkers(
        editorModel,
        sandboxInstance.editor.getId(),
        [],
      );
      sandboxInstance.editor.dispose();
      editorModel.dispose();
      const models = sandboxInstance.monaco.editor.getModels();
      for (const model of models) {
        model.dispose();
      }
    };
    // colorMode and jsx can't be reactive here because we don't want to force a recreation
    // updating of colorMode and jsx is handled in LoadedEditor
  }, []);

  return services;
};
