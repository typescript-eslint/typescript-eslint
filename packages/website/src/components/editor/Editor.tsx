import React from 'react';

import { sandboxSingleton } from '../lib/load-sandbox';
import { createProvideCodeActions } from '../lib/action';
import { createURI, messageToMarker } from '../lib/utils';
import { debounce } from '../lib/debounce';

import type {
  createTypeScriptSandbox,
  SandboxConfig,
} from '../../vendor/sandbox';
import type Monaco from 'monaco-editor';
import type {
  WebLinter,
  LintMessage,
  TSESTree,
} from '@typescript-eslint/website-eslint';
import type { ConfigModel, RuleDetails } from '../types';

interface EditorProps extends ConfigModel {
  readonly darkTheme: boolean;
  readonly decoration?: TSESTree.Node | null;
  readonly onChange?: (
    value: string,
    event: Monaco.editor.IModelContentChangedEvent,
  ) => void;
  readonly onASTChange?: (
    value: string | TSESTree.Program,
    position: Monaco.Position | null,
  ) => void;
  readonly onLoadRule?: (value: RuleDetails[]) => void;
  readonly onSelect?: (position: Monaco.Position) => void;
  readonly onLoaded?: (tsVersions: readonly string[]) => void;
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
  private sandboxInstance?: ReturnType<typeof createTypeScriptSandbox>;
  private linter?: WebLinter;

  private _subscriptions: Monaco.IDisposable[];
  private _resize?: () => void;
  private readonly _lint: () => void;
  private _codeIsUpdating: boolean;
  private _decorations: string[];

  private readonly fixes: Map<string, LintMessage>;

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
      if (this.props.rules !== prevProps.rules) {
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
    return <div id="monaco-editor-embed" style={{ height: '100%' }} />;
  }

  async loadEditor(): Promise<void> {
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
        target: 99,
        jsx: this.props.jsx ? 2 : undefined,
        module: 99,
      },
      domID: 'monaco-editor-embed',
    };
    const { main, sandboxFactory, ts, linter } = await sandboxSingleton(
      this.props.ts,
    );
    this.sandboxInstance = sandboxFactory.createTypeScriptSandbox(
      sandboxConfig,
      main,
      ts,
    );

    this.updateTheme();
    this.updateCode();
    this.linter = linter.loadLinter();
    if (this.props.onLoadRule) {
      this.props.onLoadRule(this.linter.ruleNames);
    }

    this._subscriptions.push(
      main.languages.registerCodeActionProvider(
        'typescript',
        createProvideCodeActions(this.fixes),
      ),
    );
    this._subscriptions.push(
      this.sandboxInstance.editor.onMouseDown(() => {
        this.updateCursor();
      }),
    );
    this._subscriptions.push(
      this.sandboxInstance.editor.onKeyUp(e => {
        // console.log(e.keyCode);
        if (e.keyCode >= 15 && e.keyCode <= 18) {
          this.updateCursor();
        }
      }),
    );
    this._subscriptions.push(
      this.sandboxInstance.editor.onDidChangeModelContent(event => {
        if (this.sandboxInstance && this.props.onChange) {
          this._lint();
          if (!this._codeIsUpdating) {
            const model = this.sandboxInstance.getModel().getValue();
            this.props.onChange(model, event);
          }
        }
      }),
    );
    this._lint();
    this.updateLayout();
    if (this.props.onLoaded) {
      this.props.onLoaded(this.sandboxInstance.supportedVersions);
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
      if (fatalMessage) {
        this._decorations = this.sandboxInstance.editor.deltaDecorations(
          this._decorations,
          [],
        );
      }

      this.props.onASTChange(
        fatalMessage ?? this.linter.getAst(),
        this.sandboxInstance.editor.getPosition(),
      );
      this.updateCursor();
    }
  }

  private updateCursor(): void {
    // console.log('updateCursor');
    if (this.props.onSelect && this.sandboxInstance) {
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
                stickiness: 1,
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
