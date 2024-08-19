import { useColorMode } from '@docusaurus/theme-common';
import type * as Monaco from 'monaco-editor';
import { useEffect, useState } from 'react';
import semverSatisfies from 'semver/functions/satisfies';

// eslint-disable-next-line @typescript-eslint/internal/no-relative-paths-to-internal-packages
import rootPackageJson from '../../../../../package.json';
import type { createTypeScriptSandbox } from '../../vendor/sandbox';
import { createCompilerOptions } from '../lib/createCompilerOptions';
import { createFileSystem } from '../linter/bridge';
import type { CreateLinter } from '../linter/createLinter';
import { createLinter } from '../linter/createLinter';
import type { PlaygroundSystem } from '../linter/types';
import type { RuleDetails } from '../types';
import { createTwoslashInlayProvider } from './createProvideTwoslashInlay';
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
  webLinter: CreateLinter;
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
            acquireTypes: true,
            compilerOptions:
              compilerOptions as Monaco.languages.typescript.CompilerOptions,
            domID: editorEmbedId,
          },
          main,
          window.ts,
        );
        sandboxInstance.monaco.editor.setTheme(
          colorMode === 'dark' ? 'vs-dark' : 'vs-light',
        );

        sandboxInstance.monaco.languages.registerInlayHintsProvider(
          sandboxInstance.language,
          createTwoslashInlayProvider(sandboxInstance),
        );

        const system = createFileSystem(props, sandboxInstance.tsvfs);

        // Write files in vfs when a model is created in the editor (this is used only for ATA types)
        sandboxInstance.monaco.editor.onDidCreateModel(model => {
          if (!model.uri.path.includes('node_modules')) {
            return;
          }
          const path = model.uri.path.replace('/file:///', '/');
          system.writeFile(path, model.getValue());
        });
        // Delete files in vfs when a model is disposed in the editor (this is used only for ATA types)
        sandboxInstance.monaco.editor.onWillDisposeModel(model => {
          if (!model.uri.path.includes('node_modules')) {
            return;
          }
          const path = model.uri.path.replace('/file:///', '/');
          system.deleteFile(path);
        });

        // Load the lib files from typescript to vfs (eg. es2020.d.ts)
        const worker = await sandboxInstance.getWorkerProcess();
        if (worker.getLibFiles) {
          const libs = await worker.getLibFiles();
          for (const [key, value] of Object.entries(libs)) {
            system.writeFile(`/${key}`, value);
          }
        }

        window.system = system;
        window.esquery = lintUtils.esquery;
        window.visitorKeys = lintUtils.visitorKeys;

        const webLinter = createLinter(
          system,
          lintUtils,
          sandboxInstance.tsvfs,
        );

        onLoaded(
          Array.from(webLinter.rules.values()),
          Array.from(
            new Set([...sandboxInstance.supportedVersions, window.ts.version]),
          )
            .filter(item =>
              semverSatisfies(item, rootPackageJson.devDependencies.typescript),
            )
            .sort((a, b) => b.localeCompare(a)),
        );

        setServices({
          system,
          webLinter,
          sandboxInstance,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setServices(err);
        } else {
          setServices(new Error(String(err)));
        }
      });
    return (): void => {
      if (!sandboxInstance) {
        return;
      }

      const editorModel = sandboxInstance.editor.getModel();
      if (!editorModel) {
        return;
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return services;
};
