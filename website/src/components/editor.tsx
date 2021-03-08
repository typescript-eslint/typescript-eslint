import React from 'react';
import type {
  createTypeScriptSandbox,
  PlaygroundConfig,
} from '../vendor/sandbox';
import type { TSESTree } from '@typescript-eslint/types';
import type Monaco from 'monaco-editor';

import { sandboxSingleton } from './lib/load-sandbox';
import { loadLinter, WebLinter } from './linter/linter';
import { createProvideCodeActions } from './lib/action';
import { createURI, messageToMarker } from './lib/utils';
import { debounce } from './lib/debounce';
import { HashStateOptions } from './lib/use-hash-state';

interface EditorProps extends HashStateOptions {
  darkTheme: boolean;
  decoration?: TSESTree.Node | null;
  onChange?: (
    value: string,
    event: Monaco.editor.IModelContentChangedEvent,
  ) => void;
  onASTChange?: (value: string | TSESTree.Program) => void;
  onLoadRule?: (value: string[]) => void;
  onLoaded?: () => void;
}

class Editor extends React.Component<EditorProps> {
  private sandboxInstance?: ReturnType<typeof createTypeScriptSandbox>;
  private linter?: WebLinter;

  private _actionProvider?: Monaco.IDisposable;
  private _subscription?: Monaco.IDisposable;
  private _resize?: () => void;
  private _codeIsUpdating: boolean;
  private _decorations: string[];

  private readonly fixes: Map<string, unknown[]>;

  constructor(props: EditorProps) {
    super(props);
    this.fixes = new Map();
    this._codeIsUpdating = false;
    this._decorations = [];
  }

  async componentDidMount(): Promise<void> {
    await this.loadEditor();
    this._resize = debounce((): void => this.updateLayout(), 1);
    window.addEventListener('resize', this._resize);
  }

  componentWillUnmount(): void {
    if (this._resize) {
      window.removeEventListener('resize', this._resize);
    }
    this.fixes.clear();
    this._actionProvider?.dispose();
    this._subscription?.dispose();

    if (this.sandboxInstance) {
      this.sandboxInstance.monaco.editor.setModelMarkers(
        this.sandboxInstance.editor.getModel()!,
        this.sandboxInstance.editor.getId(),
        [],
      );
      this.sandboxInstance.editor.dispose();
      const model = this.sandboxInstance.editor.getModel();
      if (model) {
        model.dispose();
      }
      const models = this.sandboxInstance.monaco.editor.getModels();
      for (const model of models) {
        model.dispose();
      }
    }
  }

  componentDidUpdate(prevProps: EditorProps): void {
    if (this.sandboxInstance) {
      const { editor } = this.sandboxInstance;
      let shouldLint = false;
      if (this.props.jsx !== prevProps.jsx) {
        this.updateConfig();
        shouldLint = true;
      }
      if (this.props.sourceType !== prevProps.sourceType) {
        shouldLint = true;
      }
      if (this.props.rules !== prevProps.rules) {
        shouldLint = true;
      }
      if (this.props.showAST !== prevProps.showAST) {
        this.updateLayout();
      }
      if (
        this.props.code !== editor.getValue() &&
        prevProps.code !== this.props.code
      ) {
        this._codeIsUpdating = true;
        // this.updateCode(); // TODO: find a better way
        shouldLint = true;
        this._codeIsUpdating = false;
      }
      if (this.props.decoration !== prevProps.decoration) {
        this.updateDecorations();
      }
      if (prevProps.darkTheme !== this.props.darkTheme) {
        this.updateTheme();
      }
      if (shouldLint) {
        this.lintCode();
      }
    }
  }

  render(): JSX.Element {
    return <div id="monaco-editor-embed" style={{ height: '100%' }} />;
  }

  async loadEditor(): Promise<void> {
    const sandboxConfig: Partial<PlaygroundConfig> = {
      text: '',
      monacoSettings: {
        minimap: { enabled: false },
        fontSize: 13,
        wordWrap: 'off',
        scrollBeyondLastLine: false,
        smoothScrolling: true,
      },
      compilerOptions: {
        jsx: this.props.jsx ? 2 : 0,
      },
      domID: 'monaco-editor-embed',
    };
    const { main, sandboxFactory, ts } = await sandboxSingleton;
    this.sandboxInstance = sandboxFactory.createTypeScriptSandbox(
      sandboxConfig,
      main,
      ts,
    );
    this.updateTheme();
    this.updateCode();
    this.linter = await loadLinter();
    if (this.props.onLoadRule) {
      this.props.onLoadRule(this.linter.ruleNames);
    }

    this._actionProvider = main.languages.registerCodeActionProvider(
      'typescript',
      createProvideCodeActions(this.fixes),
    );
    this._subscription = this.sandboxInstance.editor.onDidChangeModelContent(
      event => {
        if (this.sandboxInstance && this.props.onChange) {
          if (!this._codeIsUpdating) {
            const model = this.sandboxInstance.getModel().getValue();
            this.props.onChange(model, event);
          }
          this.lintCode();
        }
      },
    );
    this.lintCode();
    this.updateLayout();
    if (this.props.onLoaded) {
      this.props.onLoaded();
    }
  }

  private lintCode(): void {
    if (!this.sandboxInstance || !this.linter) {
      return;
    }
    const messages = this.linter.lint(
      this.props.code,
      {
        ecmaFeatures: {
          jsx: this.props.jsx ?? false,
          globalReturn: false,
        },
        ecmaVersion: 2020,
        project: ['./tsconfig.json'],
        sourceType: this.props.sourceType ?? 'module',
      },
      this.props.rules,
    );
    const markers: Monaco.editor.IMarkerData[] = [];
    this.fixes.clear();
    let fatalMessage: string | undefined = undefined;
    for (const message of messages) {
      if (!message.ruleId) {
        fatalMessage = message.message;
      }
      const marker = messageToMarker(message);
      markers.push(marker);
      this.fixes.set(createURI(marker), message);
    }
    this.sandboxInstance.monaco.editor.setModelMarkers(
      this.sandboxInstance.editor.getModel()!,
      this.sandboxInstance.editor.getId(),
      markers,
    );
    if (this.props.onASTChange) {
      this.props.onASTChange(fatalMessage ?? this.linter.getAst());
    }
  }

  private updateLayout(): void {
    if (this.sandboxInstance) {
      this.sandboxInstance.editor.layout();
    }
  }

  private updateTheme(): void {
    if (this.sandboxInstance) {
      this.sandboxInstance.monaco.editor.setTheme(
        this.props.darkTheme ? 'vs-dark' : 'vs-light',
      );
    }
  }

  private updateCode(): void {
    if (this.sandboxInstance) {
      const model = this.sandboxInstance.editor.getModel()!;
      if (model.getValue() !== this.props.code) {
        this.sandboxInstance.setText(this.props.code);
      }
    }
  }

  private updateConfig(): void {
    if (this.sandboxInstance) {
      // TODO: add more options
      this.sandboxInstance.setCompilerSettings({
        jsx: this.props.jsx ? 2 : 0,
      });
    }
  }

  private updateDecorations(): void {
    if (this.sandboxInstance) {
      if (this.props.decoration) {
        const loc = this.props.decoration.loc;
        this._decorations = this.sandboxInstance.editor.deltaDecorations(
          this._decorations,
          [
            {
              range: new this.sandboxInstance.monaco.Range(
                loc.start.line,
                loc.start.column + 1,
                loc.end.line,
                loc.end.column + 1,
              ),
              options: {
                inlineClassName: 'myLineDecoration',
              },
            },
          ],
        );
      } else {
        this._decorations = this.sandboxInstance.editor.deltaDecorations(
          this._decorations,
          [],
        );
      }
    }
  }
}

export default Editor;
