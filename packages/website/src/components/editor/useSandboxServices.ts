import { useColorMode } from '@docusaurus/theme-common';
import { useEffect, useState } from 'react';

import type {
  createTypeScriptSandbox,
  SandboxConfig,
} from '../../vendor/sandbox';
import { WebLinter } from '../linter/WebLinter';
import type { RuleDetails } from '../types';
import { createCompilerOptions } from './config';
import { editorEmbedId } from './EditorEmbed';
import { sandboxSingleton } from './loadSandbox';
import type { CommonEditorProps } from './types';

export interface SandboxServicesProps {
  readonly jsx?: boolean;
  readonly onLoaded: (
    ruleDetails: RuleDetails[],
    tsVersions: readonly string[],
  ) => void;
  readonly ts: string;
}

export type SandboxInstance = ReturnType<typeof createTypeScriptSandbox>;

export interface SandboxServices {
  sandboxInstance: SandboxInstance;
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
        const compilerOptions = createCompilerOptions();

        const sandboxConfig: Partial<SandboxConfig> = {
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
        };

        sandboxInstance = sandboxFactory.createTypeScriptSandbox(
          sandboxConfig,
          main,
          window.ts,
        );
        sandboxInstance.monaco.editor.setTheme(
          colorMode === 'dark' ? 'vs-dark' : 'vs-light',
        );

        const libEntries = new Map<string, string>();
        const worker = await sandboxInstance.getWorkerProcess();
        if (worker.getLibFiles) {
          const libs = await worker.getLibFiles();
          for (const [key, value] of Object.entries(libs)) {
            libEntries.set('/' + key, value);
          }
        }

        const system = sandboxInstance.tsvfs.createSystem(libEntries);
        window.esquery = lintUtils.esquery;

        const webLinter = new WebLinter(system, compilerOptions, lintUtils);

        onLoaded(
          webLinter.ruleNames,
          Array.from(
            new Set([...sandboxInstance.supportedVersions, window.ts.version]),
          )
            .filter(item => parseFloat(item) >= 4.2)
            .sort((a, b) => b.localeCompare(a)),
        );

        setServices({
          sandboxInstance,
          webLinter,
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
