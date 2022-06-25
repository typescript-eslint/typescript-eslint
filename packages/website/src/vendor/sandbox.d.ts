import { TypeScriptWorker } from './tsWorker';
// import lzstring from "./vendor/lzstring.min";
import * as tsvfs from './typescript-vfs';

declare type CompilerOptions =
  import('monaco-editor').languages.typescript.CompilerOptions;
declare type Monaco = typeof import('monaco-editor');
/**
 * These are settings for the playground which are the equivalent to props in React
 * any changes to it should require a new setup of the playground
 */
export declare type SandboxConfig = {
  /** The default source code for the playground */
  text: string;
  /** @deprecated */
  useJavaScript?: boolean;
  /** The default file for the playground  */
  filetype: 'js' | 'ts' | 'd.ts';
  /** Compiler options which are automatically just forwarded on */
  compilerOptions: CompilerOptions;
  /** Optional monaco settings overrides */
  monacoSettings?: import('monaco-editor').editor.IEditorOptions;
  /** Acquire types via type acquisition */
  acquireTypes: boolean;
  /** Support twoslash compiler options */
  supportTwoslashCompilerOptions: boolean;
  /** Get the text via query params and local storage, useful when the editor is the main experience */
  suppressAutomaticallyGettingDefaultText?: true;
  /** Suppress setting compiler options from the compiler flags from query params */
  suppressAutomaticallyGettingCompilerFlags?: true;
  /** Optional path to TypeScript worker wrapper class script, see https://github.com/microsoft/monaco-typescript/pull/65  */
  customTypeScriptWorkerPath?: string;
  /** Logging system */
  logger: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    groupCollapsed: (...args: any[]) => void;
    groupEnd: (...args: any[]) => void;
  };
} & (
  | {
      domID: string;
    }
  | {
      elementToAppend: HTMLElement;
    }
);
/** The default settings which we apply a partial over */
export declare function defaultPlaygroundSettings(): {
  /** The default source code for the playground */
  text: string;
  /** @deprecated */
  useJavaScript?: boolean | undefined;
  /** The default file for the playground  */
  filetype: 'js' | 'ts' | 'd.ts';
  /** Compiler options which are automatically just forwarded on */
  compilerOptions: import('monaco-editor').languages.typescript.CompilerOptions;
  /** Optional monaco settings overrides */
  monacoSettings?: import('monaco-editor').editor.IEditorOptions | undefined;
  /** Acquire types via type acquisition */
  acquireTypes: boolean;
  /** Support twoslash compiler options */
  supportTwoslashCompilerOptions: boolean;
  /** Get the text via query params and local storage, useful when the editor is the main experience */
  suppressAutomaticallyGettingDefaultText?: true | undefined;
  /** Suppress setting compiler options from the compiler flags from query params */
  suppressAutomaticallyGettingCompilerFlags?: true | undefined;
  /** Optional path to TypeScript worker wrapper class script, see https://github.com/microsoft/monaco-typescript/pull/65  */
  customTypeScriptWorkerPath?: string | undefined;
  /** Logging system */
  logger: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    groupCollapsed: (...args: any[]) => void;
    groupEnd: (...args: any[]) => void;
  };
} & {
  domID: string;
};
/** Creates a sandbox editor, and returns a set of useful functions and the editor */
export declare const createTypeScriptSandbox: (
  partialConfig: Partial<SandboxConfig>,
  monaco: Monaco,
  ts: typeof import('typescript'),
) => {
  /** The same config you passed in */
  config: {
    text: string;
    useJavaScript?: boolean | undefined;
    filetype: 'js' | 'ts' | 'd.ts';
    compilerOptions: CompilerOptions;
    monacoSettings?: import('monaco-editor').editor.IEditorOptions | undefined;
    acquireTypes: boolean;
    supportTwoslashCompilerOptions: boolean;
    suppressAutomaticallyGettingDefaultText?: true | undefined;
    suppressAutomaticallyGettingCompilerFlags?: true | undefined;
    customTypeScriptWorkerPath?: string | undefined;
    logger: {
      log: (...args: any[]) => void;
      error: (...args: any[]) => void;
      groupCollapsed: (...args: any[]) => void;
      groupEnd: (...args: any[]) => void;
    };
    domID: string;
  };
  /** A list of TypeScript versions you can use with the TypeScript sandbox */
  supportedVersions: readonly [
    '4.7.3',
    '4.6.4',
    '4.5.5',
    '4.4.4',
    '4.3.5',
    '4.2.3',
    '4.1.5',
    '4.0.5',
    '3.9.7',
    '3.8.3',
    '3.7.5',
    '3.6.3',
    '3.5.1',
    '3.3.3',
    '3.1.6',
    '3.0.1',
    '2.8.1',
    '2.7.2',
    '2.4.1',
  ];
  /** The monaco editor instance */
  editor: import('monaco-editor').editor.IStandaloneCodeEditor;
  /** Either "typescript" or "javascript" depending on your config */
  language: string;
  /** The outer monaco module, the result of require("monaco-editor")  */
  monaco: typeof import('monaco-editor');
  /** Gets a monaco-typescript worker, this will give you access to a language server. Note: prefer this for language server work because it happens on a webworker . */
  getWorkerProcess: () => Promise<TypeScriptWorker>;
  /** A copy of require("@typescript/vfs") this can be used to quickly set up an in-memory compiler runs for ASTs, or to get complex language server results (anything above has to be serialized when passed)*/
  tsvfs: typeof tsvfs;
  /** Get all the different emitted files after TypeScript is run */
  getEmitResult: () => Promise<import('typescript').EmitOutput>;
  /** Gets just the JavaScript for your sandbox, will transpile if in TS only */
  getRunnableJS: () => Promise<string>;
  /** Gets the DTS output of the main code in the editor */
  getDTSForCode: () => Promise<string>;
  /** The monaco-editor dom node, used for showing/hiding the editor */
  getDomNode: () => HTMLElement;
  /** The model is an object which monaco uses to keep track of text in the editor. Use this to directly modify the text in the editor */
  getModel: () => import('monaco-editor').editor.ITextModel;
  /** Gets the text of the main model, which is the text in the editor */
  getText: () => string;
  /** Shortcut for setting the model's text content which would update the editor */
  setText: (text: string) => void;
  /** Gets the AST of the current text in monaco - uses `createTSProgram`, so the performance caveat applies there too */
  getAST: () => Promise<import('typescript').SourceFile>;
  /** The module you get from require("typescript") */
  ts: typeof import('typescript');
  /** Create a new Program, a TypeScript data model which represents the entire project. As well as some of the
   * primitive objects you would normally need to do work with the files.
   *
   * The first time this is called it has to download all the DTS files which is needed for an exact compiler run. Which
   * at max is about 1.5MB - after that subsequent downloads of dts lib files come from localStorage.
   *
   * Try to use this sparingly as it can be computationally expensive, at the minimum you should be using the debounced setup.
   *
   * Accepts an optional fsMap which you can use to add any files, or overwrite the default file.
   *
   * TODO: It would be good to create an easy way to have a single program instance which is updated for you
   * when the monaco model changes.
   */
  setupTSVFS: (fsMapAdditions?: Map<string, string> | undefined) => Promise<{
    program: import('typescript').Program;
    system: import('typescript').System;
    host: {
      compilerHost: import('typescript').CompilerHost;
      updateFile: (sourceFile: import('typescript').SourceFile) => boolean;
    };
    fsMap: Map<string, string>;
  }>;
  /** Uses the above call setupTSVFS, but only returns the program */
  createTSProgram: () => Promise<import('typescript').Program>;
  /** The Sandbox's default compiler options  */
  compilerDefaults: {
    [
      x: string
    ]: import('monaco-editor').languages.typescript.CompilerOptionsValue;
    allowJs?: boolean | undefined;
    allowSyntheticDefaultImports?: boolean | undefined;
    allowUmdGlobalAccess?: boolean | undefined;
    allowUnreachableCode?: boolean | undefined;
    allowUnusedLabels?: boolean | undefined;
    alwaysStrict?: boolean | undefined;
    baseUrl?: string | undefined;
    charset?: string | undefined;
    checkJs?: boolean | undefined;
    declaration?: boolean | undefined;
    declarationMap?: boolean | undefined;
    emitDeclarationOnly?: boolean | undefined;
    declarationDir?: string | undefined;
    disableSizeLimit?: boolean | undefined;
    disableSourceOfProjectReferenceRedirect?: boolean | undefined;
    downlevelIteration?: boolean | undefined;
    emitBOM?: boolean | undefined;
    emitDecoratorMetadata?: boolean | undefined;
    experimentalDecorators?: boolean | undefined;
    forceConsistentCasingInFileNames?: boolean | undefined;
    importHelpers?: boolean | undefined;
    inlineSourceMap?: boolean | undefined;
    inlineSources?: boolean | undefined;
    isolatedModules?: boolean | undefined;
    jsx?: import('monaco-editor').languages.typescript.JsxEmit | undefined;
    keyofStringsOnly?: boolean | undefined;
    lib?: string[] | undefined;
    locale?: string | undefined;
    mapRoot?: string | undefined;
    maxNodeModuleJsDepth?: number | undefined;
    module?:
      | import('monaco-editor').languages.typescript.ModuleKind
      | undefined;
    moduleResolution?:
      | import('monaco-editor').languages.typescript.ModuleResolutionKind
      | undefined;
    newLine?:
      | import('monaco-editor').languages.typescript.NewLineKind
      | undefined;
    noEmit?: boolean | undefined;
    noEmitHelpers?: boolean | undefined;
    noEmitOnError?: boolean | undefined;
    noErrorTruncation?: boolean | undefined;
    noFallthroughCasesInSwitch?: boolean | undefined;
    noImplicitAny?: boolean | undefined;
    noImplicitReturns?: boolean | undefined;
    noImplicitThis?: boolean | undefined;
    noStrictGenericChecks?: boolean | undefined;
    noUnusedLocals?: boolean | undefined;
    noUnusedParameters?: boolean | undefined;
    noImplicitUseStrict?: boolean | undefined;
    noLib?: boolean | undefined;
    noResolve?: boolean | undefined;
    out?: string | undefined;
    outDir?: string | undefined;
    outFile?: string | undefined;
    paths?:
      | import('monaco-editor').languages.typescript.MapLike<string[]>
      | undefined;
    preserveConstEnums?: boolean | undefined;
    preserveSymlinks?: boolean | undefined;
    project?: string | undefined;
    reactNamespace?: string | undefined;
    jsxFactory?: string | undefined;
    composite?: boolean | undefined;
    removeComments?: boolean | undefined;
    rootDir?: string | undefined;
    rootDirs?: string[] | undefined;
    skipLibCheck?: boolean | undefined;
    skipDefaultLibCheck?: boolean | undefined;
    sourceMap?: boolean | undefined;
    sourceRoot?: string | undefined;
    strict?: boolean | undefined;
    strictFunctionTypes?: boolean | undefined;
    strictBindCallApply?: boolean | undefined;
    strictNullChecks?: boolean | undefined;
    strictPropertyInitialization?: boolean | undefined;
    stripInternal?: boolean | undefined;
    suppressExcessPropertyErrors?: boolean | undefined;
    suppressImplicitAnyIndexErrors?: boolean | undefined;
    target?:
      | import('monaco-editor').languages.typescript.ScriptTarget
      | undefined;
    traceResolution?: boolean | undefined;
    resolveJsonModule?: boolean | undefined;
    types?: string[] | undefined;
    typeRoots?: string[] | undefined;
    esModuleInterop?: boolean | undefined;
    useDefineForClassFields?: boolean | undefined;
  };
  /** The Sandbox's current compiler options */
  getCompilerOptions: () => import('monaco-editor').languages.typescript.CompilerOptions;
  /** Replace the Sandbox's compiler options */
  setCompilerSettings: (opts: CompilerOptions) => void;
  /** Overwrite the Sandbox's compiler options */
  updateCompilerSetting: (key: keyof CompilerOptions, value: any) => void;
  /** Update a single compiler option in the SAndbox */
  updateCompilerSettings: (opts: CompilerOptions) => void;
  /** A way to get callbacks when compiler settings have changed */
  setDidUpdateCompilerSettings: (func: (opts: CompilerOptions) => void) => void;
  /** A copy of lzstring, which is used to archive/unarchive code */
  // lzstring: typeof lzstring;
  /** Returns compiler options found in the params of the current page */
  createURLQueryWithCompilerOptions: (
    _sandbox: any,
    paramOverrides?: any,
  ) => string;
  /**
   * @deprecated Use `getTwoSlashCompilerOptions` instead.
   *
   * Returns compiler options in the source code using twoslash notation
   */
  getTwoSlashComplierOptions: (code: string) => any;
  /** Returns compiler options in the source code using twoslash notation */
  getTwoSlashCompilerOptions: (code: string) => any;
  /** Gets to the current monaco-language, this is how you talk to the background webworkers */
  languageServiceDefaults: import('monaco-editor').languages.typescript.LanguageServiceDefaults;
  /** The path which represents the current file using the current compiler options */
  filepath: string;
  /** Adds a file to the vfs used by the editor */
  addLibraryToRuntime: (code: string, _path: string) => void;
};
export declare type Sandbox = ReturnType<typeof createTypeScriptSandbox>;
export {};
