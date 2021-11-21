import React from 'react';
import type Monaco from 'monaco-editor';

import { sandboxSingleton } from './loadSandbox';
import { debounce } from '../lib/debounce';

import type { Sandbox, SandboxConfig } from '../../vendor/sandbox';
import type { WebLinter, TSESTree } from '@typescript-eslint/website-eslint';
import type { ConfigModel, RuleDetails } from '../types';
import { lintCode, LintCodeAction } from './lintCode';
import { action } from './action';

interface EditorProps extends ConfigModel {
  readonly darkTheme: boolean;
  readonly decoration: TSESTree.Node | null;
  readonly onChange: (value: string) => void;
  readonly onASTChange: (
    value: string | TSESTree.Program,
    position: Monaco.Position | null,
  ) => void;
  readonly onLoadRule: (value: RuleDetails[]) => void;
  readonly onSelect: (position: Monaco.Position) => void;
  readonly onLoaded: (tsVersions: readonly string[]) => void;
}

function shallowEqual(
  object1: Record<string, unknown> | undefined,
  object2: Record<string, unknown> | undefined,
): boolean {
  if (object1 === object2) {
    return true;
  }
  const keys1 = Object.keys(object1 ?? {});
  const keys2 = Object.keys(object2 ?? {});
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (object1![key] !== object2![key]) {
      return false;
    }
  }
  return true;
}

class Editor extends React.Component<EditorProps> {
  private sandboxInstance?: Sandbox;
  private linter?: WebLinter;

  private _subscriptions: Monaco.IDisposable[];
  private _resize?: () => void;
  private readonly _lint: () => void;
  private _codeIsUpdating: boolean;
  private _decorations: string[];

  static DOM_ID = 'monaco-editor-embed';

  private readonly fixes: Map<string, LintCodeAction>;

  constructor(props: EditorProps) {
    super(props);
    this.fixes = new Map();
    this._codeIsUpdating = false;
    this._decorations = [];
    this._subscriptions = [];
    this._lint = debounce((): void => this.lintCode(), 100);
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
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
    this._subscriptions = [];

    if (this.sandboxInstance) {
      this.setModelMarkers([]);
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
      if (
        this.props.jsx !== prevProps.jsx ||
        !shallowEqual(prevProps.tsConfig, this.props.tsConfig)
      ) {
        this.updateConfig();
        shouldLint = true;
      }
      if (this.props.sourceType !== prevProps.sourceType) {
        shouldLint = true;
      }
      if (!shallowEqual(prevProps.rules, this.props.rules)) {
        shouldLint = true;
      }
      if (this.props.showAST !== prevProps.showAST) {
        this.updateDecorations();
        this.updateLayout();
      }
      if (
        this.props.code !== editor.getValue() &&
        prevProps.code !== this.props.code
      ) {
        this.updateCode();
        shouldLint = true;
      }

      if (this.props.decoration !== prevProps.decoration) {
        this.updateDecorations();
      }
      if (prevProps.darkTheme !== this.props.darkTheme) {
        this.updateTheme();
      }
      if (shouldLint) {
        this._lint();
      }
    }
  }

  render(): JSX.Element {
    return <div id={Editor.DOM_ID} style={{ height: '100%' }} />;
  }

  async loadEditor(): Promise<void> {
    const { main, sandboxFactory, ts, linter } = await sandboxSingleton(
      this.props.ts,
    );
    const sandboxConfig: Partial<SandboxConfig> = {
      text: '',
      monacoSettings: {
        minimap: { enabled: false },
        fontSize: 13,
        wordWrap: 'off',
        scrollBeyondLastLine: false,
        smoothScrolling: true,
      },
      compilerOptions: {
        noResolve: true,
        strict: true,
        target: main.languages.typescript.ScriptTarget.ESNext,
        jsx: this.props.jsx
          ? main.languages.typescript.JsxEmit.React
          : undefined,
        module: main.languages.typescript.ModuleKind.ESNext,
      },
      domID: Editor.DOM_ID,
    };
    this.sandboxInstance = sandboxFactory.createTypeScriptSandbox(
      sandboxConfig,
      main,
      ts,
    );

    this.updateTheme();
    this.updateCode();
    this.linter = linter.loadLinter();
    this.props.onLoadRule(this.linter.ruleNames);

    this._subscriptions.push(
      main.languages.registerCodeActionProvider(
        'typescript',
        action(this.fixes),
      ),
    );
    this._subscriptions.push(
      this.sandboxInstance.editor.onDidChangeCursorPosition(() => {
        this.updateCursor();
      }),
    );
    this._subscriptions.push(
      this.sandboxInstance.editor.onDidChangeModelContent(() => {
        if (this.sandboxInstance) {
          this._lint();
          if (!this._codeIsUpdating) {
            const model = this.sandboxInstance.getModel().getValue();
            this.props.onChange(model);
          }
        }
      }),
    );
    this._lint();
    this.updateLayout();
    this.props.onLoaded(this.sandboxInstance.supportedVersions);
  }

  private lintCode(): void {
    if (!this.sandboxInstance || !this.linter) {
      return;
    }
    const [markers, fatalMessage, codeActions] = lintCode(
      this.linter,
      this.props.code,
      this.props.rules,
      this.props.jsx,
      this.props.sourceType,
    );
    this.fixes.clear();
    for (const codeAction of codeActions) {
      this.fixes.set(codeAction[0], codeAction[1]);
    }

    this.setModelMarkers(markers);

    if (fatalMessage) {
      this.setDecorations([]);
    }

    this.props.onASTChange(
      fatalMessage ?? this.linter.getAst(),
      this.sandboxInstance.editor.getPosition(),
    );
    this.updateCursor();
  }

  private updateCursor(): void {
    if (this.sandboxInstance) {
      const position = this.sandboxInstance.editor.getPosition();
      if (position) {
        this.props.onSelect(position);
      }
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
      this._codeIsUpdating = true;
      const model = this.sandboxInstance.editor.getModel()!;
      if (model.getValue() !== this.props.code) {
        this.sandboxInstance.editor.executeEdits(model.getValue(), [
          {
            range: model.getFullModelRange(),
            text: this.props.code,
          },
        ]);
      }
      this._codeIsUpdating = false;
    }
  }

  private updateConfig(): void {
    if (this.sandboxInstance) {
      this.sandboxInstance.setCompilerSettings({
        ...this.props.tsConfig,
        jsx: this.props.jsx ? 2 : 0,
      });
    }
  }

  private updateDecorations(): void {
    if (this.sandboxInstance) {
      if (this.props.decoration && this.props.showAST) {
        const loc = this.props.decoration.loc;
        this.setDecorations([
          {
            range: new this.sandboxInstance.monaco.Range(
              loc.start.line,
              loc.start.column + 1,
              loc.end.line,
              loc.end.column + 1,
            ),
            options: {
              inlineClassName: 'myLineDecoration',
              stickiness: 1,
            },
          },
        ]);
      } else {
        this.setDecorations([]);
      }
    }
  }

  private setModelMarkers(markers: Monaco.editor.IMarkerData[]): void {
    if (this.sandboxInstance) {
      this.sandboxInstance.monaco.editor.setModelMarkers(
        this.sandboxInstance.editor.getModel()!,
        this.sandboxInstance.editor.getId(),
        markers,
      );
    }
  }

  private setDecorations(value: Monaco.editor.IModelDeltaDecoration[]): void {
    if (this.sandboxInstance) {
      this._decorations = this.sandboxInstance.editor.deltaDecorations(
        this._decorations,
        value,
      );
    }
  }
}

export default Editor;
